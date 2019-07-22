#!/usr/bin/env node

/* eslint no-console:0 */
import "dotenv/config";
import "reflect-metadata";
import { createConnection, getConnection, getConnectionOptions } from "typeorm";
import Mqtt from "./lib/clients/Mqtt";
import { Light } from "./light/LightEntity";
import * as config from "./config";
import { MockLight } from "./light/MockLight";
import GraphqlServer from "./lib/GraphqlServer";
import logger from "./lib/logger";
import GqlPubSub from "./lib/clients/GqlPubSub";
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
    await Promise.all([getConnection().close(), Mqtt.getClient().end()]);
    logger.info("Successfully shut down. Goodbye");
    process.exit(0);
  }
);

// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  // Connect to the db (stores db connection in a singleton)
  const connectionOptions = await getConnectionOptions();
  createConnection({ ...connectionOptions, entities: [Light] });

  // Create an MQTT client (stored in a singleton)
  Mqtt.createClient(config.mqtt);

  // Create a graphql pubsub (stored in a singleton)
  GqlPubSub.createClient();

  // build TypeGraphQL executable schema
  const schema = await createSchema();

  // Create GraphQL server
  const graphqlServer = new GraphqlServer(config.server.port, schema);
  graphqlServer.start();

  if (process.env.NODE_ENV === "development") {
    console.log("develop");
    for (let i = 1; i < 9; i += 1) {
      // eslint-disable-next-line no-new
      new MockLight(`Prysma-Mock${i}`, config.mqtt);
    }
  }
})();
