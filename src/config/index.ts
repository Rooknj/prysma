const {
  PORT = 4001,
  MQTT_HOST = "localhost",
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_PORT = 1883,
  MQTT_RECONNECT_PERIOD = "5000",
} = process.env;

export const server = {
  port: PORT,
};

export const mqtt = {
  options: {
    host: `tcp://${MQTT_HOST}:${MQTT_PORT}`,
    reconnectPeriod: parseInt(MQTT_RECONNECT_PERIOD), // Amount of time between reconnection attempts
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  },
  topics: {
    top: "prysmalight",
    connected: "connected",
    state: "state",
    command: "command",
    effectList: "effects",
    config: "config",
    discovery: "discovery",
    discoveryResponse: "hello",
  },
};
