"use strict";
const EventEmitter = require("events");
const mqtt = require("async-mqtt");
const {
  validateConnectedMessage,
  validateStateMessage,
  validateEffectListMessage,
  validateConfigMessage,
  validateDiscoveryMessage,
  validateCommandMessage
} = require("../validators/mqttValidators");
const errors = require("../errors");
const Debug = require("debug").default;

const { ValidationError } = errors;
const debug = Debug("LightMessenger");

class LightMessenger extends EventEmitter {
  constructor(topics) {
    super();
    this.connected = false;
    this._client = null;
    this._topics = topics;
    this._host = null;
  }

  /**
   * Connect to the MQTT broker
   * @param {string} host - MQTT broker host
   * @param {*} options - MQTT connection options
   */
  connect(host, options = {}) {
    debug(`Connecting to MQTT broker at ${host}...`);

    this._client = mqtt.connect(host, {
      reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
      username: options.username,
      password: options.password
    });

    this._host = host;

    this._client.on("connect", this._handleConnect.bind(this));
    this._client.on("close", this._handleDisconnect.bind(this));
    this._client.on("message", this._handleMessage.bind(this));
  }

  /**
   * Disconnects from MQTT broker
   */
  end() {
    return this._client.end();
  }

  /**
   * Subscribes to all relavent light topics.
   * Will return an error if any of the subscriptions fail.
   * @param {string} lightId
   */
  async subscribeToLight(lightId) {
    if (!this.connected) {
      const errorMessage = `Can not subscribe to (${lightId}). MQTT client not connected`;
      debug(errorMessage);
      throw new Error(errorMessage);
    }

    if (!lightId) {
      const errorMessage = "You must provide a light id";
      debug(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this._topics;

    // Subscribe to all relavent fields
    const connectedPromise = this._client.subscribe(
      `${top}/${lightId}/${connected}`
    );
    const statePromise = this._client.subscribe(`${top}/${lightId}/${state}`);
    const effectListPromise = this._client.subscribe(
      `${top}/${lightId}/${effectList}`
    );
    const configPromise = this._client.subscribe(`${top}/${lightId}/${config}`);

    await Promise.all([
      connectedPromise,
      statePromise,
      effectListPromise,
      configPromise
    ]);

    debug(`Successfully subscribed to ${lightId}`);
  }

  /**
   * Unsubscribe from all relavent light topics
   * @param {string} lightId
   */
  async unsubscribeFromLight(lightId) {
    if (!this.connected) {
      return;
    }

    if (!lightId) {
      const errorMessage = "You must provide a light id";
      debug(errorMessage);
      throw new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this._topics;

    // Subscribe to all relavent fields
    const connectedPromise = this._client.unsubscribe(
      `${top}/${lightId}/${connected}`
    );
    const statePromise = this._client.unsubscribe(`${top}/${lightId}/${state}`);
    const effectListPromise = this._client.unsubscribe(
      `${top}/${lightId}/${effectList}`
    );
    const configPromise = this._client.unsubscribe(
      `${top}/${lightId}/${config}`
    );

    await Promise.all([
      connectedPromise,
      statePromise,
      effectListPromise,
      configPromise
    ]);

    debug(`Successfully unsubscribed from ${lightId}`);
  }

  /**
   * Publishes a message to the light's command topic.
   * @param {string} id
   * @param {string} message
   */
  async publishToLight(lightId, message) {
    if (!this.connected) {
      const errorMessage = `Can not publish to (${lightId}). MQTT client not connected`;
      debug(errorMessage);
      throw new Error(errorMessage);
    }

    if (!lightId) {
      const errorMessage = "You must provide a light id";
      debug(errorMessage);
      throw new Error(errorMessage);
    }
    if (!message) {
      const errorMessage = "You must provide a message";
      debug(errorMessage);
      throw new Error(errorMessage);
    }

    const validation = validateCommandMessage(message);
    if (validation.error) {
      throw new ValidationError(validation.error);
    }

    const { top, command } = this._topics;
    const payload = Buffer.from(JSON.stringify(message));
    await this._client.publish(`${top}/${lightId}/${command}`, payload);

    debug(`Successfully published ${payload.toString()} to ${lightId}`);
  }

  async startDiscovery() {
    const { top, discoveryResponse } = this._topics;
    await this._client.subscribe(`${top}/+/${discoveryResponse}`);
    debug(`Started Light Discovery`);
  }

  async stopDiscovery() {
    const { top, discoveryResponse } = this._topics;
    await this._client.unsubscribe(`${top}/+/${discoveryResponse}`);
    debug(`Stopped Light Discovery`);
  }

  async publishDiscovery() {
    const { top, discovery } = this._topics;
    await this._client.publish(`${top}/${discovery}`, "ping");
    debug(`Successfully published discovery message`);
  }

  _handleConnect(data) {
    this.connected = true;
    debug(`Connected to MQTT broker at ${this._host}`);
    this.emit("connect", data);
  }

  _handleDisconnect(data) {
    this.connected = false;
    debug(`disconnected from MQTT broker at ${this._host}`);
    this.emit("close", data);
  }

  _handleMessage(topic, message) {
    const {
      top,
      connected,
      state,
      effectList,
      config,
      discoveryResponse
    } = this._topics;
    const topicTokens = topic.split("/");
    if (topicTokens.length < 2) {
      debug(`Ignoring Message on ${topic}: topic too short`);
      return;
    } else if (topicTokens[0] !== top) {
      debug(`Ignoring Message on ${topic}: topic is unrealted to this app`);
      return;
    }

    const data = JSON.parse(message.toString());
    let validation = null;
    let event = null;

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
    }

    if (!validation) {
      return;
    }

    if (!validation.error) {
      this.emit(event, validation.value);
    } else {
      debug(validation.error);
    }
  }
}

module.exports = LightMessenger;
