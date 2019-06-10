const Mqtt = require("async-mqtt");
const logger = require("../lib/logger");

let _mqtt;

const initMqtt = async (host, options = {}) => {
  if (_mqtt) {
    throw new Error("Trying to init Mqtt again!");
  }

  logger.info(`Connecting to mqtt broker at ${host}...`);

  _mqtt = Mqtt.connect(host, {
    reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
    username: options.username,
    password: options.password,
  });

  _mqtt.on("connect", () => logger.info(`Connected to mqtt broker at ${host}`));
  _mqtt.on("close", () => logger.debug(`Failed to get connection to mqtt broker at ${host}`));
  _mqtt.on("offline", () => logger.warn("Mqtt client now offline."));
};

const getMqtt = () => {
  if (!_mqtt) throw new Error("Mqtt has not been initialized. Please call init first.");
  return _mqtt;
};

/**
 * Disconnects from MQTT broker
 */
const closeMqtt = () => {
  if (_mqtt) {
    logger.info(`Closing connection to mqtt broker`);
    return _mqtt.end();
  }
  logger.info(`Mqtt has not been initialized.`);
  return null;
};

module.exports = {
  initMqtt,
  getMqtt,
  closeMqtt,
};
