import { AsyncMqttClient } from "async-mqtt";
import { EventEmitter } from "events";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { getMqttClient } from "../lib/clients/mqttClient";
import {
  MessageType,
  ConnectionPayload,
  StatePayload,
  EffectListPayload,
  ConfigPayload,
  CommandPayload,
} from "./message-types";
import { mqtt } from "../config";
import logger from "../lib/logger";

export class LightMessenger extends EventEmitter {
  private readonly client: AsyncMqttClient;

  public connected: boolean;

  private readonly topics = mqtt.topics;

  public constructor() {
    super();
    this.client = getMqttClient();
    this.connected = this.client.connected;
    this.client.on("connect", this.handleClientConnect);
    this.client.on("offline", this.handleClientDisconnect);
    this.client.on("message", this.handleMessage);
  }

  private handleClientConnect = (): void => {
    this.connected = true;
    logger.info("Connected to MQTT Broker");
    this.emit("connect");
  };

  private handleClientDisconnect = (): void => {
    this.connected = false;
    logger.info("Disconnected to MQTT Broker");
    this.emit("disconnect");
  };

  private handleMessage = async (topic: string, message: Buffer): Promise<void> => {
    const { top, connected, state, effectList, config, discoveryResponse } = this.topics;
    const topicTokens = topic.split("/");

    // Validate the topic the message came in on
    if (topicTokens.length < 2) {
      logger.info(`Ignoring Message on ${topic}: topic too short`);
      return;
    }
    if (topicTokens[0] !== top) {
      logger.info(`Ignoring Message on ${topic}: topic is unrelated to this app`);
      return;
    }

    let data: object;
    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      logger.error(error);
      return;
    }

    // Each message topic is assigned an event and a function which will convert the data into an instance of the correct Payload class
    const possibleTopicsMap = {
      [connected]: {
        event: MessageType.Connected,
        toClass: (obj: object): ConnectionPayload => {
          return plainToClass(ConnectionPayload, obj);
        },
      },
      [state]: {
        event: MessageType.State,
        toClass: (obj: object): StatePayload => plainToClass(StatePayload, obj),
      },
      [effectList]: {
        event: MessageType.EffectList,
        toClass: (obj: object): EffectListPayload => plainToClass(EffectListPayload, obj),
      },
      [config]: {
        event: MessageType.Config,
        toClass: (obj: object): ConfigPayload => plainToClass(ConfigPayload, obj),
      },
      [discoveryResponse]: {
        event: MessageType.DiscoveryResponse,
        toClass: (obj: object): ConfigPayload => plainToClass(ConfigPayload, obj),
      },
    };

    const messageTopic = topicTokens[2];

    // Get the message event to emit from the map
    const { event, toClass } = possibleTopicsMap[messageTopic];

    // Convert the incoming data into an instance of a Payload class
    const payload = toClass(data);

    // Validate the incoming message
    const errors = await validate(payload);

    if (errors.length > 0) {
      logger.error(`Invalid message on ${topic}: Ignoring\n`, errors);
      return;
    }

    if (!event || !payload) {
      logger.error("The event or payload was not defined");
    }

    this.emit(event, payload);
  };

  public subscribeToLight = async (id: string): Promise<void> => {
    if (!this.connected) {
      const errorMessage = `Can not subscribe to (${id}). MQTT client not connected`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this.topics;

    // Subscribe to all relevant fields
    const connectedPromise = this.client.subscribe(`${top}/${id}/${connected}`);
    const statePromise = this.client.subscribe(`${top}/${id}/${state}`);
    const effectListPromise = this.client.subscribe(`${top}/${id}/${effectList}`);
    const configPromise = this.client.subscribe(`${top}/${id}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    logger.info(`Successfully subscribed to ${id}`);
  };

  public unsubscribeFromLight = async (id: string): Promise<void> => {
    if (!this.connected) {
      logger.info(`Already unsubscribed from ${id} due to disconnect`);
      return;
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this.topics;

    // Subscribe to all relevant fields
    const connectedPromise = this.client.unsubscribe(`${top}/${id}/${connected}`);
    const statePromise = this.client.unsubscribe(`${top}/${id}/${state}`);
    const effectListPromise = this.client.unsubscribe(`${top}/${id}/${effectList}`);
    const configPromise = this.client.unsubscribe(`${top}/${id}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    logger.info(`Successfully unsubscribed from ${id}`);
  };

  public startDiscovery = async (): Promise<void> => {
    const { top, discoveryResponse } = this.topics;
    await this.client.subscribe(`${top}/+/${discoveryResponse}`);
    logger.info(`Started Light Discovery`);
  };

  public stopDiscovery = async (): Promise<void> => {
    const { top, discoveryResponse } = this.topics;
    await this.client.unsubscribe(`${top}/+/${discoveryResponse}`);
    logger.info(`Stopped Light Discovery`);
  };

  public sendDiscoveryQuery = async (): Promise<void> => {
    if (!this.connected) {
      const errorMessage = `Can not publish discovery message. MQTT client not connected`;
      throw new Error(errorMessage);
    }

    const { top, discovery } = this.topics;
    await this.client.publish(`${top}/${discovery}`, "ping");
    logger.info(`Successfully sent Discovery Query`);
  };

  // Physically send a command to the light and wait for a response.
  private sendCommand = (
    id: string,
    commandPayload: CommandPayload,
    timeout: number = 5000
  ): Promise<StatePayload> =>
    new Promise((resolve, reject): void => {
      // Set up a response listener
      const onStateMessage = (statePayload: StatePayload): void => {
        if (statePayload.mutationId === commandPayload.mutationId) {
          this.removeListener(MessageType.State, onStateMessage);
          resolve(statePayload);
        }
      };
      this.on(MessageType.State, onStateMessage);

      // Convert the commandPayload into a JSON buffer
      const { top, command } = this.topics;
      const payload = Buffer.from(JSON.stringify(commandPayload));

      // Send the command and wait for a response
      // Times out after a specified duration
      this.client
        .publish(`${top}/${id}/${command}`, payload)
        .then((): void => {
          logger.info(`Successfully published ${payload.toString()} to ${id}`);
          setTimeout((): void => {
            this.removeListener(MessageType.State, onStateMessage);
            reject(new Error(`Request timed out after ${timeout}ms`));
          }, timeout);
        })
        .catch((error): void => {
          this.removeListener(MessageType.State, onStateMessage);
          reject(error);
        });
    });

  public async commandLight(id: string, commandPayload: CommandPayload): Promise<StatePayload> {
    // Validate the input
    if (!id) {
      const errorMessage = "You must provide a light id";
      throw new Error(errorMessage);
    }
    if (!commandPayload) {
      const errorMessage = "You must provide a command payload";
      throw new Error(errorMessage);
    }
    const errors = await validate(commandPayload);
    if (errors.length > 0) {
      throw errors;
    }

    // Make sure the mqtt client is connected
    if (!this.connected) {
      const errorMessage = `Can not publish to (${id}). MQTT client not connected`;
      throw new Error(errorMessage);
    }

    return this.sendCommand(id, commandPayload);
  }
}
