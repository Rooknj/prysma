#!/usr/bin/env node

/* eslint no-console:0 */
import "reflect-metadata";
import path from "path";
import { buildSchema } from "type-graphql";
import { initDbConnection, closeDbConnection } from "./lib/connections/dbConnection";
import { initMqttClient, closeMqttClient } from "./lib/connections/mqttClient";
import {
  initGraphqlSubscriptionsPubSub,
  closeGraphqlSubscriptionsPubSub,
} from "./lib/connections/graphqlSubscriptionsPubSub";
import { LightResolver } from "./light/LightResolver";
import { Light } from "./light/LightEntity";
import * as config from "./config";
import { MockLight } from "./light/MockLight";
import GraphqlServer from "./lib/GraphqlServer";
import logger from "./lib/logger";

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
  const schema = await buildSchema({
    resolvers: [LightResolver],
    // Automatically create `schema.gql` file with schema definition in current folder if not running from a pkg executable
    // Don't create the schema file if running from a pkg executable
    emitSchemaFile:
      process.env.NODE_ENV === "development" ? path.resolve(__dirname, "schema.gql") : false,
    // Use our custom PubSub system
    pubSub,
  });

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
