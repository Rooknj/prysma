import MQTT, { IClientOptions } from "async-mqtt";
import {
  CommandPayload,
  ConfigPayload,
  ConnectionPayload,
  StatePayload,
  EffectListPayload,
  PowerState,
} from "./message-types";
import logger from "../lib/logger";
import { topics } from "../lib/mqttConstants";

const INITIAL_STATE: LightState = {
  state: PowerState.off,
  color: { r: 255, g: 100, b: 0 },
  brightness: 100,
  effect: "None",
  speed: 4,
};

export interface LightState {
  state: PowerState;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
  effect: string;
  speed: number;
}

interface MqttClientOptions extends IClientOptions {
  host: string;
}

export class MockLight {
  private id: string;

  private client: MQTT.AsyncMqttClient;

  private state: LightState;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private config: any;

  private effectList = ["Mock 1", "Mock 2", "Mock 3"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(id: string, mqttConfig: MqttClientOptions, initialState?: LightState) {
    this.id = id;
    this.config = {
      id,
      name: id,
      version: "1.0.0-mock",
      hardware: "MockHardware",
      colorOrder: "RGB",
      stripType: "MockStrip",
      ipAddress: "10.0.0.1",
      macAddress: "AA:BB:CC:DD:EE:FF",
      numLeds: 60,
      udpPort: 7778,
    };
    this.state = initialState || INITIAL_STATE;
    const { top, connected } = topics;

    const { host, ...mqttClientOptions } = mqttConfig;
    this.client = MQTT.connect(host, {
      ...mqttClientOptions,
      will: {
        topic: `${top}/${this.id}/${connected}`,
        payload: JSON.stringify({ name: this.id, connection: 0 }),
        qos: 0,
        retain: true,
      },
    });

    this.client.on("connect", (): void => {
      logger.debug("Mock: Connected to MQTT");
      this.subscribeToCommands();
      this.subscribeToDiscovery();
      this.publishToState({ name: this.id, ...this.state });
      this.publishToEffectList({
        name: this.id,
        effectList: this.effectList,
      });
      this.publishToConnected({ name: this.id, connection: "2" });
      this.publishToConfig(this.config);
    });
    this.client.on("message", this.handleMessage.bind(this));
  }

  private async handleCommandMessage(data: CommandPayload): Promise<void> {
    logger.debug("Received command message:", data);
    const { mutationId, state, color, brightness, effect, speed } = data;
    // Set the new state
    if ("state" in data && state !== undefined) this.state.state = state;
    if ("color" in data && color !== undefined) {
      this.state.effect = "None";
      this.state.color = color;
      this.state.state = PowerState.on;
    }
    if ("brightness" in data && brightness !== undefined) this.state.brightness = brightness;
    if ("effect" in data && effect !== undefined) {
      this.state.effect = effect;
      this.state.color = { r: 255, g: 255, b: 255 };
      this.state.state = PowerState.on;
    }
    if ("speed" in data && speed !== undefined) this.state.speed = speed;

    const response = { name: this.id, mutationId, ...this.state };
    await this.publishToState(response);
  }

  private async handleDiscoveryMessage(): Promise<void> {
    logger.debug(`Received Discovery message`);
    await this.publishToDiscoveryResponse(this.config);
  }

  public setState(state: LightState): void {
    this.state = state;
  }

  public end(): Promise<void> {
    return this.client.end();
  }

  public async publishToState(stateMessage: StatePayload): Promise<void> {
    const { top, state } = topics;
    const topic = `${top}/${this.id}/${state}`;
    const payload = Buffer.from(JSON.stringify(stateMessage));
    try {
      logger.debug(`Publishing State: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  public async publishToEffectList(effectListMessage: EffectListPayload): Promise<void> {
    const { top, effectList } = topics;
    const topic = `${top}/${this.id}/${effectList}`;
    const payload = Buffer.from(JSON.stringify(effectListMessage));
    try {
      logger.debug(`Publishing Effect List: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  public async publishToConnected(connectedMessage: ConnectionPayload): Promise<void> {
    const { top, connected } = topics;
    const topic = `${top}/${this.id}/${connected}`;
    const payload = Buffer.from(JSON.stringify(connectedMessage));
    try {
      logger.debug(`Publishing Connected: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  public async publishToConfig(configMessage: ConfigPayload): Promise<void> {
    const { top, config } = topics;
    const topic = `${top}/${this.id}/${config}`;
    const payload = Buffer.from(JSON.stringify(configMessage));
    try {
      logger.debug(`Publishing Config: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  public async publishToDiscoveryResponse(discoveryResponseMessage: ConfigPayload): Promise<void> {
    const { top, discoveryResponse } = topics;
    const topic = `${top}/${this.id}/${discoveryResponse}`;
    const payload = Buffer.from(JSON.stringify(discoveryResponseMessage));
    try {
      logger.debug(`Publishing Discovery Response: ${payload}`);
      await this.client.publish(topic, payload);
    } catch (error) {
      logger.debug(error);
    }
  }

  public async subscribeToCommands(): Promise<void> {
    const { top, command } = topics;
    const topic = `${top}/${this.id}/${command}`;
    try {
      await this.client.subscribe(topic);
    } catch (error) {
      logger.debug(error);
    }
  }

  public async subscribeToDiscovery(): Promise<void> {
    const { top, discovery } = topics;
    const topic = `${top}/${discovery}`;
    try {
      await this.client.subscribe(topic);
    } catch (error) {
      logger.debug(error);
    }
  }

  public async handleMessage(topic: string, message: object): Promise<void> {
    const { top, command, discovery } = topics;

    // Parse the JSON into a usable javascript object
    if (topic === `${top}/${this.id}/${command}`) {
      const data = JSON.parse(message.toString());
      await this.handleCommandMessage(data);
    } else if (topic === `${top}/${discovery}`) {
      await this.handleDiscoveryMessage();
    }
  }
}
