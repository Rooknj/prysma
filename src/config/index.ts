import path from "path";
import { ConnectionOptions } from "typeorm";

const {
  PORT = 4001,
  MQTT_HOST = "localhost",
  MQTT_PORT = 1883,
  MQTT_USERNAME = "pi",
  MQTT_PASSWORD = "MQTTIsBetterThanUDP",
  NODE_ENV,
} = process.env;

export const server = {
  port: PORT,
};

export const mqtt = {
  host: `tcp://${MQTT_HOST}:${MQTT_PORT}`,
  options: {
    reconnectPeriod: 5000, // Amount of time between reconnection attempts
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

export const db: ConnectionOptions = {
  type: "sqlite",
  synchronize: true,
  logging: false,
  // Create the SQLite database in the executable's directory if running from a pkg executable
  // TODO: Store in configuration directory
  database:
    NODE_ENV === "development"
      ? path.join(__dirname, "..", "..", "data", "prysma.sqlite")
      : path.join("data", "prysma.sqlite"),
};
