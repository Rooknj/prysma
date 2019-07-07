import { promisify } from "util";
import { Repository } from "typeorm";
import { PubSub } from "apollo-server";
import { validate } from "class-validator";
import throttle from "lodash.throttle";
import { getDbConnection } from "../lib/connections/dbConnection";
import { getGraphqlSubscriptionsPubSub } from "../lib/connections/graphqlSubscriptionsPubSub";
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
import logger from "../lib/logger";

const asyncSetTimeout = promisify(setTimeout);
const addLightDelay = 500;
const discoveryDuration = 2000;

export class LightService {
  private readonly lightRepo: Repository<Light>;

  private readonly messenger: LightMessenger;

  private readonly pubSub: PubSub;

  private discoveredLights: Light[] = [];

  // The constructor parameters are Dependency Injected
  public constructor() {
    this.lightRepo = getDbConnection().getRepository(Light);
    this.pubSub = getGraphqlSubscriptionsPubSub();
    this.messenger = new LightMessenger();

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
    logger.info("Messenger Connected");

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
    logger.info("Messenger Disconnected");

    // Set all light's connected status to false
    const lights = await this.lightRepo.find();
    await Promise.all(
      lights.map(({ id }): Promise<Light> => this.updateLight(id, { connected: false }))
    );
  };

  // TODO: Make these message handlers more generic using the Strategy Pattern
  // TODO: Be more specific on the type of error that can/cannot be thrown by updateLight
  private handleConnectionMessage = async (connectionPayload: ConnectionPayload): Promise<void> => {
    logger.info("connection Message");
    const { name } = connectionPayload;
    try {
      await this.updateLight(name, connectionPayloadToLightFields(connectionPayload));
    } catch (error) {
      logger.error(`Error handling connection message: ${error}`);
    }
  };

  private handleStateMessage = async (statePayload: StatePayload): Promise<void> => {
    logger.info("State Message");
    const { name } = statePayload;
    try {
      await this.updateLight(name, statePayloadToLightFields(statePayload));
    } catch (error) {
      logger.error(`Error handling state message: ${error}`);
    }
  };

  private handleEffectListMessage = async (effectListPayload: EffectListPayload): Promise<void> => {
    logger.info("EffectList Message");
    const { name } = effectListPayload;
    try {
      await this.updateLight(name, effectListPayloadToLightFields(effectListPayload));
    } catch (error) {
      logger.error(`Error handling effect list message: ${error}`);
    }
  };

  private handleConfigMessage = async (configPayload: ConfigPayload): Promise<void> => {
    logger.info("Config Message");
    const { name } = configPayload;
    try {
      await this.updateLight(name, configPayloadToLightFields(configPayload));
    } catch (error) {
      logger.error(`Error handling config message: ${error}`);
    }
  };

  private handleDiscoveryResponseMessage = async (
    discoveryResponsePayload: ConfigPayload
  ): Promise<void> => {
    logger.info("Discovery Response Message");
    const { name } = discoveryResponsePayload;

    // Make sure the light isn't already added
    let lightIsAlreadyAdded = true;
    try {
      await this.lightRepo.findOneOrFail(name);
    } catch (error) {
      lightIsAlreadyAdded = false;
    }
    if (lightIsAlreadyAdded) {
      logger.info(`${name} is already added. Ignoring discovery response.`);
      return;
    }

    // Make sure we didn't already discover the light
    if (this.discoveredLights.find((light): boolean => light.id === name)) {
      logger.info(`${name} was already discovered. Ignoring discovery response.`);
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
    logger.info(`Updating Light: ${id}`);

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

  // This function is throttled in case multiple clients are looking for lights at the same time so we don't clear discoveredLights every time
  public discoverLights = throttle(
    async (): Promise<Light[]> => {
      this.discoveredLights = [];
      await this.messenger.sendDiscoveryQuery();
      await asyncSetTimeout(discoveryDuration);
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
    },
    discoveryDuration,
    { leading: true, trailing: false }
  );

  public findLightById = (id: string): Promise<Light> => {
    logger.info(`Finding Light: ${id}`);
    return this.lightRepo.findOneOrFail(id);
  };

  public findAllLights = (): Promise<Light[]> => {
    logger.info(`Finding All Lights`);
    return this.lightRepo.find();
  };

  // This physically sends a command message to the light if any state fields are specified
  public changeLight = async (id: string, lightData: LightInput): Promise<Light> => {
    logger.info(`Changing Light: ${id}`);
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
    logger.info(`Adding Light: ${id}`);

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
      logger.error(`Error subscribing to ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    // Remove the light from the discoveredLights array since we just added it
    this.discoveredLights = this.discoveredLights.filter(
      (discoveredLight): boolean => discoveredLight.id !== id
    );

    // This gives the server time to update the added light's state based on incoming MQTT messages
    // TODO: See if there is a better way to do this
    await asyncSetTimeout(addLightDelay);

    // Return the added light with the find operation
    return this.lightRepo.findOneOrFail(id);
  };

  public removeLightById = async (id: string): Promise<Light> => {
    logger.info(`Removing Light: ${id}`);

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
      logger.error(`Error unsubscribing from ${id}`, error);
      // TODO: Do nothing if the error was due to the messenger not being connected, throw otherwise
    }

    await this.lightRepo.delete(id);

    return lightToRemove;
  };
}
