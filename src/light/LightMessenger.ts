import { Service, Inject } from "typedi";
import { AsyncMqttClient } from "async-mqtt";
import { EventEmitter } from "events";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import {
  MessageType,
  ConnectionPayload,
  StatePayload,
  EffectListPayload,
  ConfigPayload,
  CommandPayload,
} from "./message-types";

@Service()
export class LightMessenger extends EventEmitter {
  private readonly client: AsyncMqttClient;

  public connected: boolean;

  private readonly topics = {
    top: "prysmalight",
    connected: "connected",
    state: "state",
    command: "command",
    effectList: "effects",
    config: "config",
    discovery: "discovery",
    discoveryResponse: "hello",
  };

  public constructor(@Inject("MQTT_CLIENT") client: AsyncMqttClient) {
    super();
    this.client = client;
    this.connected = this.client.connected;
    this.client.on("connect", this.handleClientConnect);
    this.client.on("offline", this.handleClientDisconnect);
    this.client.on("message", this.handleMessage);
  }

  private handleClientConnect = (): void => {
    this.connected = true;
    console.log("Connected to MQTT Broker");
    this.emit("connect");
  };

  private handleClientDisconnect = (): void => {
    this.connected = false;
    console.log("Disconnected to MQTT Broker");
    this.emit("disconnect");
  };

  private handleMessage = async (topic: string, message: Buffer): Promise<void> => {
    const { top, connected, state, effectList, config, discoveryResponse } = this.topics;
    const topicTokens = topic.split("/");

    // Validate the topic the message came in on
    if (topicTokens.length < 2) {
      console.log(`Ignoring Message on ${topic}: topic too short`);
      return;
    }
    if (topicTokens[0] !== top) {
      console.log(`Ignoring Message on ${topic}: topic is unrelated to this app`);
      return;
    }

    let data: object;
    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error(error);
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
      console.error(`Invalid message on ${topic}: Ignoring\n`, errors);
      return;
    }

    if (!event || !payload) {
      console.error("The event or payload was not defined");
    }

    this.emit(event, payload);
  };

  public subscribeToLight = async (id: string): Promise<void> => {
    if (!this.connected) {
      const errorMessage = `Can not subscribe to (${id}). MQTT client not connected`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this.topics;

    // Subscribe to all relevant fields
    const connectedPromise = this.client.subscribe(`${top}/${id}/${connected}`);
    const statePromise = this.client.subscribe(`${top}/${id}/${state}`);
    const effectListPromise = this.client.subscribe(`${top}/${id}/${effectList}`);
    const configPromise = this.client.subscribe(`${top}/${id}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    console.info(`Successfully subscribed to ${id}`);
  };

  public unsubscribeFromLight = async (id: string): Promise<void> => {
    if (!this.connected) {
      console.info(`Already unsubscribed from ${id} due to disconnect`);
      return;
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this.topics;

    // Subscribe to all relevant fields
    const connectedPromise = this.client.unsubscribe(`${top}/${id}/${connected}`);
    const statePromise = this.client.unsubscribe(`${top}/${id}/${state}`);
    const effectListPromise = this.client.unsubscribe(`${top}/${id}/${effectList}`);
    const configPromise = this.client.unsubscribe(`${top}/${id}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    console.info(`Successfully unsubscribed from ${id}`);
  };

  public async publishToLight(id: string, message: CommandPayload): Promise<void> {
    if (!this.connected) {
      const errorMessage = `Can not publish to (${id}). MQTT client not connected`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!id) {
      const errorMessage = "You must provide a light id";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (!message) {
      const errorMessage = "You must provide a message";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const errors = await validate(message);
    if (errors.length > 0) {
      throw errors;
    }

    const { top, command } = this.topics;
    const payload = Buffer.from(JSON.stringify(message));
    await this.client.publish(`${top}/${id}/${command}`, payload);

    console.info(`Successfully published ${payload.toString()} to ${id}`);
  }

  // Physically send a command to the light and wait for a response.
  private sendCommand = (
    id: string,
    commandPayload: CommandPayload,
    timeout: number = 5000
  ): Promise<void> =>
    new Promise((resolve, reject): void => {
      // Set up a response listener
      const onStateMessage = ({ mutationId }: StatePayload): void => {
        if (mutationId === commandPayload.mutationId) {
          this.removeListener(MessageType.State, onStateMessage);
          resolve();
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
          console.log(`Successfully published ${payload.toString()} to ${id}`);
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

  public async commandLight(id: string, commandPayload: CommandPayload): Promise<void> {
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

    await this.sendCommand(id, commandPayload);
  }
}
