"use strict";

const Mqtt = require("async-mqtt");
const Debug = require("debug").default;

const debug = Debug("Client:Mqtt");
let _mqtt;

const initMqtt = async (host, options = {}) => {
  if (_mqtt) {
    throw new Error("Trying to init Mqtt again!");
  }

  debug(`Connecting to MQTT broker at ${host}...`);

  _mqtt = Mqtt.connect(host, {
    reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
    username: options.username,
    password: options.password
  });

  _mqtt.on("connect", () => debug(`Connected to MQTT broker at ${host}`));
  _mqtt.on("close", () => debug(`disconnected from MQTT broker at ${host}`));
};

const getMqtt = () => {
  if (!_mqtt)
    throw new Error("Mqtt has not been initialized. Please called init first.");
  return _mqtt;
};

/**
 * Disconnects from MQTT broker
 */
const endMqtt = () => {
  return _mqtt.end();
};

module.exports = {
  initMqtt,
  getMqtt,
  endMqtt
};
