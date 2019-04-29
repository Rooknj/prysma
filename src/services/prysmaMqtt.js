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

  connect(host, topics, options) {
    debug(`Connecting to MQTT broker at ${host}`);
    this.client = mqtt.connect(host, {
      reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
      username: options.username,
      password: options.password
    });

    this.topics = topics;

    this.client.on("connect", data => {
      debug(`Connected to MQTT broker at ${host}`);
      this.emit("connect", data);
      this.connected = true;
    });
    this.client.on("close", data => {
      debug(`disconnected from MQTT broker at ${host}`);
      this.emit("close", data);
      this.connected = false;
    });
  }

  disconnect() {
    return this.client.end();
  }

  testAsyncMethod(data) {
    this.emit("data", data);
  }
}

module.exports = PrysmaMqtt;
