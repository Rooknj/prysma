import path from "path";
import { homedir } from "os";
import { ConnectionOptions } from "typeorm";

const {
  PORT,
  MQTT_HOST = "localhost",
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_PORT = 1883,
  MQTT_RECONNECT_PERIOD = "5000",
  NODE_ENV,
  DOCKER,
} = process.env;

const getServerPort = (): string | number => {
  if (PORT) {
    return PORT;
  }

  if (NODE_ENV === "development") {
    return 4001;
  }

  return 80;
};

export const server = {
  port: getServerPort(),
};

export const mqtt = {
  host: `tcp://${MQTT_HOST}:${MQTT_PORT}`,
  reconnectPeriod: parseInt(MQTT_RECONNECT_PERIOD), // Amount of time between reconnection attempts
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
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

export const dbDefault: ConnectionOptions = {
  type: "sqlite",
  database: `${getBaseConfigPath()}/.prysma/prysma.db`,
  synchronize: true,
  logging: false,
};
