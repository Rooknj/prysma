"use strict";
const EventEmitter = require("events");
const mqtt = require("async-mqtt");
const Debug = require("debug").default;

const debug = Debug("mqtt");

class PrysmaMqtt extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.client = null;
    this.topics = null;
  }

  /**
   * Connect to the MQTT broker
   * @param {string} host - MQTT broker host
   * @param {object} topics - Object containing topic name info
   * @param {*} options - MQTT connection options
   */
  connect(host, topics, options) {
    debug(`Connecting to MQTT broker at ${host}`);
    this.client = mqtt.connect(host, {
      reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
      username: options.username,
      password: options.password
    });

    this.topics = topics;

    this.client.on("connect", data => {
      this.connected = true;
      debug(`Connected to MQTT broker at ${host}`);
      this.emit("connect", data);
    });
    this.client.on("close", data => {
      this.connected = false;
      debug(`disconnected from MQTT broker at ${host}`);
      this.emit("close", data);
    });
  }

  /**
   * Disconnects from MQTT broker
   */
  disconnect() {
    return this.client.end();
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

    const { top, connected, state, effectList, config } = this.topics;
    try {
      // Subscribe to all relavent fields
      const connectedPromise = this.client.subscribe(
        `${top}/${lightId}/${connected}`
      );
      const statePromise = this.client.subscribe(`${top}/${lightId}/${state}`);
      const effectListPromise = this.client.subscribe(
        `${top}/${lightId}/${effectList}`
      );
      const configPromise = this.client.subscribe(
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

    const { top, connected, state, effectList, config } = this.topics;
    try {
      // Subscribe to all relavent fields
      const connectedPromise = this.client.unsubscribe(
        `${top}/${lightId}/${connected}`
      );
      const statePromise = this.client.unsubscribe(
        `${top}/${lightId}/${state}`
      );
      const effectListPromise = this.client.unsubscribe(
        `${top}/${lightId}/${effectList}`
      );
      const configPromise = this.client.unsubscribe(
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

      const { top, command } = this.topics;
      try {
        this.client.publish(
          `${top}/${lightId}/${command}`,
          Buffer.from(message)
        );
      } catch (error) {
        debug(`Error publishing to ${lightId}`);
        return error;
      }
    }
  }

  testAsyncMethod(data) {
    this.emit("data", data);
  }
}

module.exports = PrysmaMqtt;
