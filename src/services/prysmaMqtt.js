"use strict";
const EventEmitter = require("events");
const mqtt = require("async-mqtt");
const Debug = require("debug").default;

const debug = Debug("mqtt");

class PrysmaMqtt extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this._client = null;
    this._topics = null;
    this._host = null;
  }

  /**
   * Connect to the MQTT broker
   * @param {string} host - MQTT broker host
   * @param {object} topics - Object containing topic name info
   * @param {*} options - MQTT connection options
   */
  connect(host, topics, options) {
    debug(`Connecting to MQTT broker at ${host}`);
    this._client = mqtt.connect(host, {
      reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
      username: options.username,
      password: options.password
    });

    this._host = host;
    this._topics = topics;

    this._client.on("connect", this._handleConnect.bind(this));
    this._client.on("close", this._handleDisconnect.bind(this));
    this._client.on("message", this._handleMessage.bind(this));
  }

  /**
   * Disconnects from MQTT broker
   */
  disconnect() {
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
      return new Error(errorMessage);
    }

    if (!lightId) {
      const errorMessage = "You must provide a light id";
      debug(errorMessage);
      return new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this._topics;
    try {
      // Subscribe to all relavent fields
      const connectedPromise = this._client.subscribe(
        `${top}/${lightId}/${connected}`
      );
      const statePromise = this._client.subscribe(`${top}/${lightId}/${state}`);
      const effectListPromise = this._client.subscribe(
        `${top}/${lightId}/${effectList}`
      );
      const configPromise = this._client.subscribe(
        `${top}/${lightId}/${config}`
      );

      await Promise.all([
        connectedPromise,
        statePromise,
        effectListPromise,
        configPromise
      ]);

      debug(`Successfully subscribed to ${lightId}`);
    } catch (error) {
      debug(`Error subscribing to ${lightId}`);
      return error;
    }
  }

  /**
   * Unsubscribe from all relavent light topics
   * @param {string} lightId
   */
  async unsubscribeFromLight(lightId) {
    if (!lightId) {
      const errorMessage = "You must provide a light id";
      debug(errorMessage);
      return new Error(errorMessage);
    }

    const { top, connected, state, effectList, config } = this._topics;
    try {
      // Subscribe to all relavent fields
      const connectedPromise = this._client.unsubscribe(
        `${top}/${lightId}/${connected}`
      );
      const statePromise = this._client.unsubscribe(
        `${top}/${lightId}/${state}`
      );
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
    } catch (error) {
      debug(`Error unsubscribing from ${lightId}`);
      return error;
    }
  }

  /**
   * Publishes a message to the light's command topic.
   * @param {string} id
   * @param {string} message
   */
  async publishToLight(lightId, message) {
    {
      if (!this.connected) {
        const errorMessage = `Can not publish to (${lightId}). MQTT client not connected`;
        debug(errorMessage);
        return new Error(errorMessage);
      }

      if (!lightId) {
        const errorMessage = "You must provide a light id";
        debug(errorMessage);
        return new Error(errorMessage);
      }
      if (!message) {
        const errorMessage = "You must provide a message";
        debug(errorMessage);
        return new Error(errorMessage);
      }

      const { top, command } = this._topics;
      try {
        this._client.publish(
          `${top}/${lightId}/${command}`,
          Buffer.from(JSON.stringify(message))
        );
      } catch (error) {
        debug(`Error publishing to ${lightId}`);
        return error;
      }
    }
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
    const { top, connected, state, effectList, config } = this._topics;
    const topicTokens = topic.split("/");
    if (topicTokens.length < 2) {
      debug(`Ignoring Message on ${topic}: topic too short`);
      return;
    } else if (topicTokens[0] !== top) {
      debug(`Ignoring Message on ${topic}: topic is unrealted to this app`);
      return;
    }

    const parseMessage = msg => JSON.parse(msg.toString());

    switch (topicTokens[2]) {
      case connected:
        this.emit("connectedMessage", parseMessage(message));
        break;
      case state:
        this.emit("stateMessage", parseMessage(message));
        break;
      case effectList:
        this.emit("effectListMessage", parseMessage(message));
        break;
      case config:
        this.emit("configMessage", parseMessage(message));
        break;
    }
  }
}

module.exports = PrysmaMqtt;
