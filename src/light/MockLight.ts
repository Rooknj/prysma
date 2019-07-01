import MQTT from "async-mqtt";
import {
  CommandPayload,
  ConfigPayload,
  ConnectionPayload,
  StatePayload,
  EffectListPayload,
  PowerState,
} from "./message-types";

export class MockLight {
  private id: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private topics: any;

  private client: MQTT.AsyncMqttClient;

  private state = {
    state: PowerState.off,
    color: { r: 255, g: 100, b: 0 },
    brightness: 100,
    effect: "None",
    speed: 4,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private config: any;

  private effectList = ["Mock 1", "Mock 2", "Mock 3"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(id: string, mqttConfig: any) {
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
    this.topics = mqttConfig.topics;
    const { top, connected } = this.topics;

    this.client = MQTT.connect(mqttConfig.host, {
      ...mqttConfig.options,
      will: {
        topic: `${top}/${this.id}/${connected}`,
        payload: JSON.stringify({ name: this.id, connection: 0 }),
        qos: 0,
        retain: true,
      },
    });

    this.client.on("connect", (): void => {
      console.log("Mock: Connected to MQTT");
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
    console.log("Received command message:", data);
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
    console.log(`Received Discovery message`);
    await this.publishToDiscoveryResponse(this.config);
  }

  public async publishToState(stateMessage: StatePayload): Promise<void> {
    const { top, state } = this.topics;
    const topic = `${top}/${this.id}/${state}`;
    const payload = Buffer.from(JSON.stringify(stateMessage));
    try {
      console.log(`Publishing State: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      console.log(error);
    }
  }

  public async publishToEffectList(effectListMessage: EffectListPayload): Promise<void> {
    const { top, effectList } = this.topics;
    const topic = `${top}/${this.id}/${effectList}`;
    const payload = Buffer.from(JSON.stringify(effectListMessage));
    try {
      console.log(`Publishing Effect List: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      console.log(error);
    }
  }

  public async publishToConnected(connectedMessage: ConnectionPayload): Promise<void> {
    const { top, connected } = this.topics;
    const topic = `${top}/${this.id}/${connected}`;
    const payload = Buffer.from(JSON.stringify(connectedMessage));
    try {
      console.log(`Publishing Connected: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      console.log(error);
    }
  }

  public async publishToConfig(configMessage: ConfigPayload): Promise<void> {
    const { top, config } = this.topics;
    const topic = `${top}/${this.id}/${config}`;
    const payload = Buffer.from(JSON.stringify(configMessage));
    try {
      console.log(`Publishing Config: ${payload}`);
      await this.client.publish(topic, payload, { qos: 0, retain: true });
    } catch (error) {
      console.log(error);
    }
  }

  public async publishToDiscoveryResponse(discoveryResponseMessage: ConfigPayload): Promise<void> {
    const { top, discoveryResponse } = this.topics;
    const topic = `${top}/${this.id}/${discoveryResponse}`;
    const payload = Buffer.from(JSON.stringify(discoveryResponseMessage));
    try {
      console.log(`Publishing Discovery Response: ${payload}`);
      await this.client.publish(topic, payload);
    } catch (error) {
      console.log(error);
    }
  }

  public async subscribeToCommands(): Promise<void> {
    const { top, command } = this.topics;
    const topic = `${top}/${this.id}/${command}`;
    try {
      await this.client.subscribe(topic);
    } catch (error) {
      console.log(error);
    }
  }

  public async subscribeToDiscovery(): Promise<void> {
    const { top, discovery } = this.topics;
    const topic = `${top}/${discovery}`;
    try {
      await this.client.subscribe(topic);
    } catch (error) {
      console.log(error);
    }
  }

  public async handleMessage(topic: string, message: object): Promise<void> {
    const { top, command, discovery } = this.topics;

    // Parse the JSON into a usable javascript object
    if (topic === `${top}/${this.id}/${command}`) {
      const data = JSON.parse(message.toString());
      await this.handleCommandMessage(data);
    } else if (topic === `${top}/${discovery}`) {
      await this.handleDiscoveryMessage();
    }
  }
}
