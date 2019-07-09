import path from "path";
import { ConnectionOptions } from "typeorm";
import { homedir } from "os";

const {
  PORT = 4001,
  MQTT_HOST = "localhost",
  MQTT_PORT = 1883,
  MQTT_USERNAME = "pi",
  MQTT_PASSWORD = "MQTTIsBetterThanUDP",
  NODE_ENV,
  DOCKER,
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

const getBaseConfigPath = (): string => {
  if (DOCKER) {
    return "data";
  }

  if (NODE_ENV === "development") {
    return path.join(__dirname, "..", "..");
  }

  return homedir();
};

export const db: ConnectionOptions = {
  type: "sqlite",
  synchronize: true,
  logging: false,
  database: path.join(getBaseConfigPath(), ".prysma", "prysma.db"),
};
