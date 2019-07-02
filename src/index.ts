/* eslint no-console:0 */
import "reflect-metadata";
import path from "path";
import { Container } from "typedi";
import { ApolloServer } from "apollo-server";
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

// TODO: Figure out how to get rid of dependency injection and instead use getRepository on typeORM and the singleton pattern
// TODO: Somehow initialize the listeners so that the server isn't ready until the lightMessenger is initialized
// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  // Connect to outside dependencies
  const [connection, mqttClient, pubSub] = await Promise.all([
    initDbConnection({ ...config.db, entities: [Light] }),
    initMqttClient(config.mqtt.host, config.mqtt.options),
    initGraphqlSubscriptionsPubSub(),
  ]);
  Container.set("GRAPHQL_PUB_SUB", pubSub); // Set up Dependency Injection
  Container.set("DB_CONNECTION", connection); // Set up Dependency Injection
  Container.set("MQTT_CLIENT", mqttClient); // Set up Dependency Injection (AsyncMqttClient type causes an error here)

  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [LightResolver],
    // Automatically create `schema.gql` file with schema definition in current folder if not running from a pkg executable
    // Don't create the schema file if running from a pkg executable
    emitSchemaFile: process.env.NODE_ENV ? path.resolve(__dirname, "schema.gql") : false,
    // register 3rd party IOC container
    container: Container,
    // Use our custom PubSub system
    pubSub,
  });

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    // enable GraphQL Playground
    playground: true,
  });

  if (process.env.NODE_ENV === "development") {
    for (let i = 1; i < 9; i += 1) {
      // eslint-disable-next-line no-new
      new MockLight(`Prysma-Mock${i}`, config.mqtt);
    }
  }

  const { url } = await server.listen(config.server.port);
  console.log(`🚀 Server ready at ${url}`);
})();
