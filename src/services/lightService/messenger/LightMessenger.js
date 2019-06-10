const EventEmitter = require("events");
const { getMqtt } = require("../../../clients/mqtt");
const {
  validateConnectedMessage,
  validateStateMessage,
  validateEffectListMessage,
  validateConfigMessage,
  validateDiscoveryMessage,
  validateCommandMessage,
} = require("../validators/mqttValidators");
const { ValidationError } = require("../../../lib/errors");
const logger = require("../../../lib/logger");

class LightMessenger extends EventEmitter {
  constructor(topics) {
    super();
    this._topics = topics;
    this._client = getMqtt();
    this.connected = this._client.connected;
    this._client.on("connect", this._handleConnect.bind(this));
    this._client.on("offline", this._handleDisconnect.bind(this));
    this._client.on("message", this._handleMessage.bind(this));
  }

  /**
   * Subscribes to all relavent light topics.
   * Will return an error if any of the subscriptions fail.
   * @param {string} lightId
   */
  async subscribeToLight(lightId) {
    if (!this.connected) {
      const errorMessage = `Can not subscribe to (${lightId}). MQTT client not connected`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!lightId) {
      const errorMessage = "You must provide a light id";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this._topics;

    // Subscribe to all relavent fields
    const connectedPromise = this._client.subscribe(`${top}/${lightId}/${connected}`);
    const statePromise = this._client.subscribe(`${top}/${lightId}/${state}`);
    const effectListPromise = this._client.subscribe(`${top}/${lightId}/${effectList}`);
    const configPromise = this._client.subscribe(`${top}/${lightId}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    logger.info(`Successfully subscribed to ${lightId}`);
  }

  /**
   * Unsubscribe from all relavent light topics
   * @param {string} lightId
   */
  async unsubscribeFromLight(lightId) {
    if (!this.connected) {
      logger.info(`Already unsubscribed from ${lightId} due to disconnect`);
      return;
    }

    if (!lightId) {
      const errorMessage = "You must provide a light id";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this._topics;

    // Subscribe to all relavent fields
    const connectedPromise = this._client.unsubscribe(`${top}/${lightId}/${connected}`);
    const statePromise = this._client.unsubscribe(`${top}/${lightId}/${state}`);
    const effectListPromise = this._client.unsubscribe(`${top}/${lightId}/${effectList}`);
    const configPromise = this._client.unsubscribe(`${top}/${lightId}/${config}`);

    await Promise.all([connectedPromise, statePromise, effectListPromise, configPromise]);

    logger.info(`Successfully unsubscribed from ${lightId}`);
  }

  /**
   * Publishes a message to the light's command topic.
   * @param {string} id
   * @param {string} message
   */
  async publishToLight(lightId, message) {
    if (!this.connected) {
      const errorMessage = `Can not publish to (${lightId}). MQTT client not connected`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (!lightId) {
      const errorMessage = "You must provide a light id";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (!message) {
      const errorMessage = "You must provide a message";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const validation = validateCommandMessage(message);
    if (validation.error) {
      throw new ValidationError(validation.error);
    }

    const { top, command } = this._topics;
    const payload = Buffer.from(JSON.stringify(message));
    await this._client.publish(`${top}/${lightId}/${command}`, payload);

    logger.info(`Successfully published ${payload.toString()} to ${lightId}`);
  }

  async startDiscovery() {
    const { top, discoveryResponse } = this._topics;
    await this._client.subscribe(`${top}/+/${discoveryResponse}`);
    logger.info(`Started Light Discovery`);
  }

  async stopDiscovery() {
    const { top, discoveryResponse } = this._topics;
    await this._client.unsubscribe(`${top}/+/${discoveryResponse}`);
    logger.info(`Stopped Light Discovery`);
  }

  async publishDiscovery() {
    if (!this.connected) {
      const errorMessage = `Can not publish discovery message. MQTT client not connected`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, discovery } = this._topics;
    await this._client.publish(`${top}/${discovery}`, "ping");
    logger.info(`Successfully published discovery message`);
  }

  _handleConnect(data) {
    this.connected = true;
    this.emit("connect", data);
  }

  _handleDisconnect(data) {
    this.connected = false;
    this.emit("disconnect", data);
  }

  _handleMessage(topic, message) {
    const { top, connected, state, effectList, config, discoveryResponse } = this._topics;
    const topicTokens = topic.split("/");
    if (topicTokens.length < 2) {
      logger.warn(`Ignoring Message on ${topic}: topic too short`);
      return;
    }
    if (topicTokens[0] !== top) {
      logger.warn(`Ignoring Message on ${topic}: topic is unrealted to this app`);
      return;
    }

    const data = JSON.parse(message.toString());

    let validation;
    let event;
    switch (topicTokens[2]) {
      case connected:
        validation = validateConnectedMessage(data);
        event = "connectedMessage";
        break;
      case state:
        validation = validateStateMessage(data);
        event = "stateMessage";
        break;
      case effectList:
        validation = validateEffectListMessage(data);
        event = "effectListMessage";
        break;
      case config:
        validation = validateConfigMessage(data);
        event = "configMessage";
        break;
      case discoveryResponse:
        validation = validateDiscoveryMessage(data);
        event = "discoveryMessage";
        break;
      default:
        validation = null;
        event = null;
    }

    if (!validation) {
      return;
    }

    if (!validation.error) {
      this.emit(event, validation.value);
    } else {
      logger.error(validation.error);
    }
  }
}

module.exports = LightMessenger;
