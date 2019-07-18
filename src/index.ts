#!/usr/bin/env node

/* eslint no-console:0 */
import "reflect-metadata";
import { initDbConnection, closeDbConnection } from "./lib/connections/dbConnection";
import { initMqttClient, closeMqttClient } from "./lib/connections/mqttClient";
import {
  initGraphqlSubscriptionsPubSub,
  closeGraphqlSubscriptionsPubSub,
} from "./lib/connections/graphqlSubscriptionsPubSub";
import { Light } from "./light/LightEntity";
import * as config from "./config";
import { MockLight } from "./light/MockLight";
import GraphqlServer from "./lib/GraphqlServer";
import logger from "./lib/logger";
import { createSchema } from "./lib/createSchema";

console.log(`💡  Initializing Prysma 💡`);

// Unhandled error logging
process.on("uncaughtException", (error): void => {
  logger.error("Unhandled Exception", error);
  process.exit(1);
});
process.on("unhandledRejection", (error): void => {
  logger.error("Unhandled Rejection", error);
  process.exit(1);
});

// listen for the signal interruption (ctrl-c)
// Close all connected clients
process.on(
  "SIGINT",
  async (): Promise<void> => {
    logger.info("SIGINT signal received, shutting down gracefully...");
    await Promise.all([closeDbConnection(), closeMqttClient(), closeGraphqlSubscriptionsPubSub()]);
    logger.info("Successfully shut down. Goodbye");
    process.exit(0);
  }
);

// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  // Connect to outside dependencies
  const [pubSub] = await Promise.all([
    initGraphqlSubscriptionsPubSub(),
    initDbConnection({ ...config.db, entities: [Light] }),
    initMqttClient(config.mqtt.host, config.mqtt.options),
  ]);

  // build TypeGraphQL executable schema
  const schema = await createSchema(pubSub);

  // Create GraphQL server
  const graphqlServer = new GraphqlServer(config.server.port, schema);
  graphqlServer.start();

  if (process.env.NODE_ENV === "development") {
    for (let i = 1; i < 9; i += 1) {
      // eslint-disable-next-line no-new
      new MockLight(`Prysma-Mock${i}`, config.mqtt);
    }
  }
})();
