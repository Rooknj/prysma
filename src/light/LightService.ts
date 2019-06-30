import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import { PubSub } from "apollo-server";
import { validate } from "class-validator";
import { Light } from "./LightEntity";
import { LightInput } from "./LightInput";
import {
  LightMessenger,
  ConnectionPayload,
  MessageType,
  StatePayload,
  EffectListPayload,
  ConfigPayload,
} from "./light-messenger";
import { LIGHT_CHANGED } from "./light-events";
import { lightInputToPublishPayload, powerStateToOn, rgbToHexString } from "./light-utils";

// TODO: Add Discovery
@Service()
export class LightService {
  private readonly lightRepo: Repository<Light>;

  private readonly messenger: LightMessenger;

  private readonly pubSub: PubSub;

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
    await Promise.all(lights.map(({ id }): Promise<void> => this.messenger.subscribeToLight(id)));

    // TODO: Subscribe to discovery topics
    // // Subscribe to discovery topic
    // subscriptionPromises.push(this.messenger.startDiscovery());
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

  private handleConnectionMessage = async (data: ConnectionPayload): Promise<void> => {
    console.log("connection Message");
    const { name } = data;
    await this.updateLight(name, { connected: data.connection === "2" });
  };

  private handleStateMessage = async (data: StatePayload): Promise<void> => {
    console.log("State Message");
    const { mutationId, name } = data;
    if (mutationId) {
      // Notify changeLight
      console.log("Mutation Response");
    }
    await this.updateLight(name, {
      on: powerStateToOn(data.state),
      brightness: data.brightness,
      color: rgbToHexString(data.color),
      effect: data.effect,
      speed: data.speed,
    });
  };

  private handleEffectListMessage = async (data: EffectListPayload): Promise<void> => {
    console.log("EffectList Message");
    const { name } = data;
    await this.updateLight(name, { supportedEffects: data.effectList });
  };

  private handleConfigMessage = async (data: ConfigPayload): Promise<void> => {
    console.log("Config Message");
    const { name } = data;
    await this.updateLight(name, {
      version: data.version,
      hardware: data.hardware,
      colorOrder: data.colorOrder,
      stripType: data.stripType,
      ipAddress: data.ipAddress,
      macAddress: data.macAddress,
      numLeds: data.numLeds,
      udpPort: data.udpPort,
    });
  };

  private handleDiscoveryResponseMessage = async (data: ConfigPayload): Promise<void> => {
    console.log("Discovery Response Message", data);
    // TODO: Update the DB
  };

  // This updates the light data in persistent storage and notifies subscribers
  // If you want to physically change the light, call changeLight
  private updateLight = async (
    id: string,
    lightData: Partial<Omit<Light, "id">>
  ): Promise<Light> => {
    console.log(`Updating Light: ${id}`);

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

    // Check if the light exists and is connected
    const lightToChange = await this.lightRepo.findOneOrFail(id);
    if (!lightToChange.connected) throw new Error(`"${id}" is not connected`);

    const publishPayload = lightInputToPublishPayload(id, lightData);
    console.log(publishPayload);

    // TODO: Implement this properly so it only returns once a response from the light was received or times out after 5 seconds
    //await this.messenger.publishToLight(id, publishPayload);

    return lightToChange;
  };

  public addNewLight = async (id: string): Promise<Light> => {
    console.log(`Adding Light: ${id}`);
    // Check if the light was already added
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

    await this.lightRepo.save(light);

    // Subscribe to the light
    try {
      await this.messenger.subscribeToLight(id);
    } catch (error) {
      // Do nothing because we will just resubscribe when the messenger connects due to this.handleMessengerConnect
      console.error(`Error subscribing to ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    return light;
  };

  public removeLightById = async (id: string): Promise<Light> => {
    console.log(`Removing Light: ${id}`);

    // Unsubscribe from the light
    try {
      await this.messenger.unsubscribeFromLight(id);
    } catch (error) {
      // Do nothing because we are already unsubscribed if the messenger isn't connected
      console.error(`Error unsubscribing from ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    const lightToRemove = await this.lightRepo.findOneOrFail(id);

    // For some reason repo.remove deletes the ID of lightToRemove, so we are saving a deep copy to return
    const removedLight = Object.assign({}, lightToRemove);

    await this.lightRepo.remove(lightToRemove);

    return removedLight;
  };
}
