const mqtt = require("async-mqtt");
const logger = require("../lib/logger");

class MockLight {
  constructor(lightId, config) {
    this._id = lightId;
    this._topics = config.topics;

    const { top, connected } = this._topics;
    this._client = mqtt.connect(config.host, {
      ...config.options,
      will: {
        topic: `${top}/${this._id}/${connected}`,
        payload: Buffer.from(JSON.stringify({ name: this._id, connection: 0 })),
        qos: 0,
        retain: true,
      },
    });

    this._state = {
      state: "OFF",
      color: { r: 255, g: 100, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4,
    };

    this._config = {
      id: this._id,
      name: this._id,
      version: "1.0.0-mock",
      hardware: "MockHardware",
      colorOrder: "RGB",
      stripType: "MockStrip",
      ipAddress: "10.0.0.1",
      macAddress: "AA:BB:CC:DD:EE:FF",
      numLeds: 60,
      udpPort: 7778,
    };

    this._effectList = ["Test 1", "Test 2", "Test 3"];

    this._client.on("connect", () => {
      logger.debug("Connected to MQTT");
      this.subscribeToCommands();
      this.subscribeToDiscovery();
      this.publishToState({ name: this._id, ...this._state });
      this.publishToEffectList({
        name: this._id,
        effectList: this._effectList,
      });
      this.publishToConnected({ name: this._id, connection: 2 });
      this.publishToConfig({ name: this._id, ...this._config });
    });
    this._client.on("message", this.handleMessage.bind(this));
  }

  async publishToState(stateMessage) {
    const { top, state } = this._topics;
    const topic = `${top}/${this._id}/${state}`;
    const payload = Buffer.from(JSON.stringify(stateMessage));
    try {
      logger.debug(`Publishing State: ${payload}`);
      await this._client.publish(topic, payload, { retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  async publishToEffectList(effectListMessage) {
    const { top, effectList } = this._topics;
    const topic = `${top}/${this._id}/${effectList}`;
    const payload = Buffer.from(JSON.stringify(effectListMessage));
    try {
      logger.debug(`Publishing Effect List: ${payload}`);
      await this._client.publish(topic, payload, { retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  async publishToConnected(connectedMessage) {
    const { top, connected } = this._topics;
    const topic = `${top}/${this._id}/${connected}`;
    const payload = Buffer.from(JSON.stringify(connectedMessage));
    try {
      logger.debug(`Publishing Connected: ${payload}`);
      await this._client.publish(topic, payload, { retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  async publishToConfig(configMessage) {
    const { top, config } = this._topics;
    const topic = `${top}/${this._id}/${config}`;
    const payload = Buffer.from(JSON.stringify(configMessage));
    try {
      logger.debug(`Publishing Config: ${payload}`);
      await this._client.publish(topic, payload, { retain: true });
    } catch (error) {
      logger.debug(error);
    }
  }

  async publishToDiscoveryResponse(discoveryResponseMessage) {
    const { top, discoveryResponse } = this._topics;
    const topic = `${top}/${this._id}/${discoveryResponse}`;
    const payload = Buffer.from(JSON.stringify(discoveryResponseMessage));
    try {
      logger.debug(`Publishing Discovery Response: ${payload}`);
      await this._client.publish(topic, payload);
    } catch (error) {
      logger.debug(error);
    }
  }

  async subscribeToCommands() {
    const { top, command } = this._topics;
    const topic = `${top}/${this._id}/${command}`;
    try {
      await this._client.subscribe(topic);
    } catch (error) {
      logger.debug(error);
    }
  }

  async subscribeToDiscovery() {
    const { top, discovery } = this._topics;
    const topic = `${top}/${discovery}`;
    try {
      await this._client.subscribe(topic);
    } catch (error) {
      logger.debug(error);
    }
  }

  async handleMessage(topic, message) {
    const { top, command, discovery } = this._topics;

    // Parse the JSON into a usable javascript object
    if (topic === `${top}/${this._id}/${command}`) {
      const data = JSON.parse(message.toString());
      await this._handleCommandMessage(data);
    } else if (topic === `${top}/${discovery}`) {
      await this._handleDiscoveryMessage();
    }
  }

  async _handleCommandMessage(data) {
    logger.debug("Recieved command message:", data);
    const { mutationId, state, color, brightness, effect, speed } = data;
    // Set the new state
    if ("state" in data) this._state.state = state;
    if ("color" in data) {
      this._state.effect = "None";
      this._state.color = color;
      this._state.state = "ON";
    }
    if ("brightness" in data) this._state.brightness = brightness;
    if ("effect" in data) {
      this._state.effect = effect;
      this._state.color = { r: 255, g: 255, b: 255 };
      this._state.state = "ON";
    }
    if ("speed" in data) this._state.speed = speed;

    const response = { name: this._id, mutationId, ...this._state };
    await this.publishToState(response);
  }

  async _handleDiscoveryMessage() {
    logger.debug(`Recieved Discovery message`);
    const response = { name: this._id, ...this._config };
    await this.publishToDiscoveryResponse(response);
  }
}

module.exports = MockLight;
