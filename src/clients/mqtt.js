"use strict";

const Mqtt = require("async-mqtt");
const Debug = require("debug").default;

const debug = Debug("Client:Mqtt");
let _mqtt;

const initMqtt = async (host, options = {}) => {
  if (_mqtt) {
    throw new Error("Trying to init Mqtt again!");
  }

  debug(`Connecting to mqtt broker at ${host}...`);

  _mqtt = Mqtt.connect(host, {
    reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
    username: options.username,
    password: options.password
  });

  _mqtt.on("connect", () => debug(`Connected to mqtt broker at ${host}`));
  _mqtt.on("close", () => debug(`disconnected from mqtt broker at ${host}`));
};

const getMqtt = () => {
  if (!_mqtt)
    throw new Error("Mqtt has not been initialized. Please call init first.");
  return _mqtt;
};

/**
 * Disconnects from MQTT broker
 */
const closeMqtt = () => {
  if (_mqtt) {
    debug(`Closing connection to mqtt broker`);
    return _mqtt.end();
  }
  debug(`Mqtt has not been initialized.`);
};

module.exports = {
  initMqtt,
  getMqtt,
  closeMqtt
};
