import MQTT from "async-mqtt";
import logger from "../logger";

let mqttClient: MQTT.AsyncMqttClient;

export const initMqttClient = async (
  host: string,
  options: MQTT.IClientOptions = {}
): Promise<MQTT.AsyncMqttClient> => {
  if (mqttClient) {
    throw new Error("Trying to init Mqtt again!");
  }

  logger.info(`Connecting to mqtt broker at ${host}...`);
  mqttClient = MQTT.connect(host, options);

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
};

export const getMqttClient = (): MQTT.AsyncClient => {
  if (!mqttClient) throw new Error("Mqtt has not been initialized. Please call init first.");
  return mqttClient;
};

/**
 * Disconnects from MQTT broker
 */
export const closeMqttClient = async (): Promise<void> => {
  if (mqttClient) {
    logger.info(`Closing Mqtt Client`);
    await mqttClient.end();
    return;
  }
  logger.info(`Mqtt has not been initialized.`);
};
