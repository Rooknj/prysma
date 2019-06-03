"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const config = require("./config");
const Server = require("./server");
const packageJson = require("../package.json");
const { initDb, closeDb } = require("./clients/db");
const { initMqtt, closeMqtt } = require("./clients/mqtt");
const LightService = require("./services/LightService");
const SubscriptionService = require("./services/SubscriptionService");
const MockLight = require("./MockLight");

// Verbose statement of service starting
const { version } = packageJson;
console.log(`--- Prysma v${version} ---`);

// Unhandled error logging
process.on("uncaughtException", err => {
  console.error("Unhandled Exception", err);
  process.exit(1);
});
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection", err);
  process.exit(1);
});

// listen for the signal interruption (ctrl-c)
// Close redis, close sequelize if needed, close MQTT client, log that it is closing
process.on("SIGINT", async () => {
  console.log("SIGINT signal received, shutting down gracefully...");
  const closePromises = [closeDb(), closeMqtt()];
  await Promise.all(closePromises);
  console.log("Succesfully shut down. Goodbye");
  process.exit(0);
});

const start = async () => {
  // Initialize all client connections (like database connection)
  if (!process.env.MOCK) {
    console.log("Initializing Clients...");
    const clientPromises = [initDb(config.db), initMqtt(config.mqtt.host, config.mqtt.options)];
    await Promise.all(clientPromises);
    console.log("Initialization Complete");
  }

  // Initialize our services
  const lightService = new LightService(config);
  const subscriptionService = new SubscriptionService();
  const serviceInitPromises = [lightService.init(), subscriptionService.init()];
  await Promise.all(serviceInitPromises);
  const services = { lightService, subscriptionService };

  // Start the server
  console.log("Starting Server...");
  const server = new Server(services);
  server.start(config.server.port);
  console.log(`🚀 Server ready at http://localhost:${config.server.port}${server.graphqlPath}`);
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${config.server.port}${server.subscriptionsPath}`
  );
};

start();

// Start a new Mock Light
new MockLight("Prysma-Mock", config.mqtt);
