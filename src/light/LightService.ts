import { promisify } from "util";
import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import { PubSub } from "apollo-server";
import { validate } from "class-validator";
import { Light } from "./LightEntity";
import { LightInput } from "./LightInput";
import { LightMessenger } from "./LightMessenger";
import {
  ConnectionPayload,
  MessageType,
  StatePayload,
  EffectListPayload,
  ConfigPayload,
} from "./message-types";
import { LIGHT_CHANGED } from "./light-events";
import {
  lightInputToCommandPayload,
  statePayloadToLightFields,
  connectionPayloadToLightFields,
  effectListPayloadToLightFields,
  configPayloadToLightFields,
} from "./light-utils";

@Service()
export class LightService {
  private readonly lightRepo: Repository<Light>;

  private readonly messenger: LightMessenger;

  private readonly pubSub: PubSub;

  private discoveredLights: Light[] = [];

  // The constructor parameters are Dependency Injected
  public constructor(connection: Connection, messenger: LightMessenger, pubSub: PubSub) {
    this.lightRepo = connection.getRepository(Light);
    this.messenger = messenger;
    this.pubSub = pubSub;

    if (this.messenger.connected) {
      this.handleMessengerConnect();
    }

    this.messenger.on("connect", this.handleMessengerConnect);
    this.messenger.on("disconnect", this.handleMessengerDisconnect);
    this.messenger.on(MessageType.Connected, this.handleConnectionMessage);
    this.messenger.on(MessageType.State, this.handleStateMessage);
    this.messenger.on(MessageType.EffectList, this.handleEffectListMessage);
    this.messenger.on(MessageType.Config, this.handleConfigMessage);
    this.messenger.on(MessageType.DiscoveryResponse, this.handleDiscoveryResponseMessage);
  }

  private handleMessengerConnect = async (): Promise<void> => {
    console.log("Messenger Connected");

    // Subscribe to all the lights
    const lights = await this.lightRepo.find();
    const subscriptionPromises = lights.map(
      ({ id }): Promise<void> => this.messenger.subscribeToLight(id)
    );
    // Subscribe to discovery topic
    subscriptionPromises.push(this.messenger.startDiscovery());
    await Promise.all(subscriptionPromises);
    // TODO: Actually handle an error if one occurs (or just keep on crashing)
  };

  private handleMessengerDisconnect = async (): Promise<void> => {
    console.log("Messenger Disconnected");

    // Set all light's connected status to false
    const lights = await this.lightRepo.find();
    await Promise.all(
      lights.map(({ id }): Promise<Light> => this.updateLight(id, { connected: false }))
    );
  };

  private handleConnectionMessage = async (connectionPayload: ConnectionPayload): Promise<void> => {
    console.log("connection Message");
    const { name } = connectionPayload;
    await this.updateLight(name, connectionPayloadToLightFields(connectionPayload));
  };

  private handleStateMessage = async (statePayload: StatePayload): Promise<void> => {
    console.log("State Message");
    const { name } = statePayload;
    await this.updateLight(name, statePayloadToLightFields(statePayload));
  };

  private handleEffectListMessage = async (effectListPayload: EffectListPayload): Promise<void> => {
    console.log("EffectList Message");
    const { name } = effectListPayload;
    await this.updateLight(name, effectListPayloadToLightFields(effectListPayload));
  };

  private handleConfigMessage = async (configPayload: ConfigPayload): Promise<void> => {
    console.log("Config Message");
    const { name } = configPayload;
    await this.updateLight(name, configPayloadToLightFields(configPayload));
  };

  private handleDiscoveryResponseMessage = async (
    discoveryResponsePayload: ConfigPayload
  ): Promise<void> => {
    console.log("Discovery Response Message");
    const { name } = discoveryResponsePayload;

    // Make sure the light isn't already added
    let lightIsAlreadyAdded = true;
    try {
      await this.lightRepo.findOneOrFail(name);
    } catch (error) {
      lightIsAlreadyAdded = false;
    }
    if (lightIsAlreadyAdded) {
      console.log(`${name} is already added. Ignoring discovery response.`);
      return;
    }

    // Make sure we didn't already discover the light
    if (this.discoveredLights.find((light): boolean => light.id === name)) {
      console.log(`${name} was already discovered. Ignoring discovery response.`);
    }

    // Add the discovered light to this.discoveredLights
    const discoveredLight = Light.createDefaultLight(name);
    Object.assign(discoveredLight, configPayloadToLightFields(discoveryResponsePayload));
    this.discoveredLights.push(discoveredLight);
  };

  // This updates the light data in persistent storage and notifies subscribers
  // If you want to physically change the light, call changeLight
  private updateLight = async (
    id: string,
    lightData: Partial<Omit<Light, "id">>
  ): Promise<Light> => {
    console.log(`Updating Light: ${id}`);

    // Make sure the light is currently added
    const lightToUpdate = await this.lightRepo.findOneOrFail(id);

    // Assign the new properties to the light
    Object.assign(lightToUpdate, lightData);

    // Validate that it is a valid light
    const errors = await validate(lightToUpdate);
    if (errors.length > 0) {
      throw errors;
    }

    // Persist the changes
    await this.lightRepo.save(lightToUpdate);

    // Notify subscribers of the new light data
    this.pubSub.publish(LIGHT_CHANGED, lightToUpdate);

    return lightToUpdate;
  };

  public discoverLights = async (discoveryDuration: number): Promise<Light[]> => {
    this.discoveredLights = [];
    await this.messenger.sendDiscoveryQuery();
    await promisify(setTimeout)(discoveryDuration);
    return this.discoveredLights.sort((a: Light, b: Light): number => {
      const x = a.id.toLowerCase();
      const y = b.id.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
  };

  public findLightById = (id: string): Promise<Light> => {
    console.log(`Finding Light: ${id}`);
    return this.lightRepo.findOneOrFail(id);
  };

  public findAllLights = (): Promise<Light[]> => {
    console.log(`Finding All Lights`);
    return this.lightRepo.find();
  };

  // This physically sends a command message to the light if any state fields are specified
  public changeLight = async (id: string, lightData: LightInput): Promise<Light> => {
    console.log(`Changing Light: ${id}`);
    // Make sure the light exists and is connected
    const lightToChange = await this.lightRepo.findOneOrFail(id);
    if (!lightToChange.connected) throw new Error(`"${id}" is not connected`);

    const { name, ...stateData } = lightData;

    // If we want to change the name, update the name
    let changedLight: Light = lightToChange;
    if (name) {
      changedLight = await this.updateLight(id, { name });
    }

    // Physically change the light if any state fields were included in lightData.
    // The actual database update will be performed by handleStateMessage
    if (Object.keys(stateData).length) {
      // Generate the command to send
      const commandPayload = lightInputToCommandPayload(id, stateData);
      // Actually send the command and wait for a response
      const statePayload = await this.messenger.commandLight(id, commandPayload);
      // Update the return object with the new state data
      Object.assign(changedLight, statePayloadToLightFields(statePayload));
    }

    return changedLight;
  };

  public addNewLight = async (id: string): Promise<Light> => {
    console.log(`Adding Light: ${id}`);

    // Make sure the light was not already added
    let lightAlreadyExists = true;
    try {
      await this.lightRepo.findOneOrFail(id);
    } catch (error) {
      lightAlreadyExists = false;
    }

    // Don't add the light again if it already exists
    if (lightAlreadyExists) {
      throw new Error(`${id} was already added`);
    }

    // Create the new light object
    const light = Light.createDefaultLight(id);

    await this.lightRepo.insert(light);

    // Subscribe to the light
    try {
      await this.messenger.subscribeToLight(id);
    } catch (error) {
      // Do nothing because we will just resubscribe when the messenger connects due to this.handleMessengerConnect
      console.error(`Error subscribing to ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    // Return the added light with the find operation
    // This gives the server time to update the added light's state based on incoming MQTT messages
    return this.lightRepo.findOneOrFail(id);
  };

  public removeLightById = async (id: string): Promise<Light> => {
    console.log(`Removing Light: ${id}`);

    // Make sure the light is currently added
    let lightToRemove: Light;
    try {
      lightToRemove = await this.lightRepo.findOneOrFail(id);
    } catch (error) {
      throw new Error(`${id} is not currently added`);
    }

    // Unsubscribe from the light
    try {
      await this.messenger.unsubscribeFromLight(id);
    } catch (error) {
      // Do nothing because we are already unsubscribed if the messenger isn't connected
      console.error(`Error unsubscribing from ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    await this.lightRepo.delete(id);

    return lightToRemove;
  };
}
