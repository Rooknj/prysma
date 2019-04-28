"use strict";
const EventEmitter = require("events");
const mqtt = require("async-mqtt");
const Debug = require("debug").default;

const debug = Debug("mqtt");

class PrysmaMqtt extends EventEmitter {
  constructor(config) {
    super();
    this.connected = false;
    this.client = mqtt.connect(config.host, {
      reconnectPeriod: config.reconnectPeriod, // Amount of time between reconnection attempts
      username: config.username,
      password: config.password
    });

    this.client.on("connect", data => {
      this.emit("connect", data);
      debug("Connected to MQTT");
      this.connected = true;
    });
    this.client.on("close", data => {
      this.emit("close", data);
      debug("disconnected from MQTT");
      this.connected = false;
    });
  }

  testAsyncMethod(data) {
    this.emit("data", data);
  }
}

module.exports = PrysmaMqtt;
