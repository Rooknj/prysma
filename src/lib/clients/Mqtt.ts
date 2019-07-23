import { AsyncMqttClient, connect, IClientOptions } from "async-mqtt";
import logger from "../logger";
import { ClientSingleton } from "./ClientSingleton";

let mqttClient: AsyncMqttClient;

interface MqttClientOptions extends IClientOptions {
  host: string;
}

export default class Mqtt extends ClientSingleton {
  public static createClient(options: MqttClientOptions): AsyncMqttClient {
    if (mqttClient) {
      throw new Error("Trying to init Mqtt again!");
    }

    const { host, ...mqttClientOptions } = options;

    logger.info(`Connecting to mqtt broker at ${host}...`);
    mqttClient = connect(
      host,
      mqttClientOptions
    );

    mqttClient.on("connect", (): void => {
      logger.info(`Connected to mqtt broker at ${host}`);
    });
    mqttClient.on("close", (): void => {
      logger.debug(`Failed to get connection to mqtt broker at ${host}`);
    });
    mqttClient.on("offline", (): void => {
      logger.warn("Mqtt client now offline.");
    });

    return mqttClient;
  }

  public static getClient(): AsyncMqttClient {
    if (!mqttClient) throw new Error("Mqtt has not been initialized. Please call init first.");
    return mqttClient;
  }
}
