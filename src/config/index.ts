import path from "path";
import { ConnectionOptions } from "typeorm";

export const server = {
  port: 4001,
};

export const mqtt = {
  host: `tcp://${process.env.MQTT_HOST}:1883` || "tcp://localhost:1883",
  options: {
    reconnectPeriod: 5000, // Amount of time between reconnection attempts
    username: "pi",
    password: "MQTTIsBetterThanUDP",
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
  database: process.env.NODE_ENV
    ? path.join(__dirname, "..", "data", "test.sqlite")
    : path.join("data", "test.sqlite"),
};
