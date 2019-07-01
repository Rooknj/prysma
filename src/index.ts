/* eslint no-console:0 */
import "reflect-metadata";
import path from "path";
import { Container } from "typedi";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { createConnection, Connection } from "typeorm";
import { PubSub } from "graphql-subscriptions";
import MQTT from "async-mqtt";
import { LightResolver } from "./light/LightResolver";
import { Light } from "./light/LightEntity";
import * as config from "./config";
import { MockLight } from "./light/MockLight";

console.log(`💡  Initializing Prysma 💡`);

// Unhandled error logging
process.on("uncaughtException", (error): void => {
  console.error("Unhandled Exception", error);
  process.exit(1);
});
process.on("unhandledRejection", (error): void => {
  console.error("Unhandled Rejection", error);
  process.exit(1);
});

// listen for the signal interruption (ctrl-c)
// Close all connected clients
process.on(
  "SIGINT",
  async (): Promise<void> => {
    console.log("SIGINT signal received, shutting down gracefully...");
    // TODO: Close connected clients
    console.log("Successfully shut down. Goodbye");
    process.exit(0);
  }
);

// TODO: Figure out how to get rid of dependency injection and instead use getRepository on typeORM and the singleton pattern
// TODO: Somehow initialize the listeners so that the server isn't ready until the lightMessenger is initialized
// Wrap index.js inside an immediately invoked async function
(async (): Promise<void> => {
  // Set up a pub sub system for Graphql Subscriptions
  const pubSub = new PubSub();
  Container.set(PubSub, pubSub); // Set up Dependency Injection

  // Connect to outside dependencies
  const [connection, mqttClient] = await Promise.all([
    createConnection({ ...config.db, entities: [Light] }),
    MQTT.connect(config.mqtt.host, config.mqtt.options),
  ]);
  Container.set(Connection, connection); // Set up Dependency Injection
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
    // eslint-disable-next-line no-new
    new MockLight("Prysma-Mock", config.mqtt);
  }

  const { url } = await server.listen(config.server.port);
  console.log(`🚀 Server ready at ${url}`);
})();