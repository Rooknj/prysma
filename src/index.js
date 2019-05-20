"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const config = require("./config");
const Server = require("./server");
const packageJson = require("../package.json");
const LightService = require("./services/LightService");
const MockLight = require("./MockLight");

// Verbose statement of service starting
const { version } = packageJson;
console.log(`--- Prysma v${version} ---`);

// Unhandled error logging
process.on("uncaughtException", err => {
  console.log("Unhandled Exception", err);
  process.exit(1);
});
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection", err);
  process.exit(1);
});

const initializeServices = async conf => {
  // Initialize services
  const lightService = new LightService();
  await lightService.init(conf);
  return { lightService };
};

const start = async () => {
  let services;
  if (!process.env.MOCK) {
    console.log("Initializing Services...");
    services = await initializeServices(config);
    console.log("Initialization Complete");
  }

  console.log("Starting Server...");
  const server = new Server(services);
  server.start(config.server.port);
  console.log(
    `🚀 Server ready at http://localhost:${config.server.port}${
      server.graphqlPath
    }`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${config.server.port}${
      server.subscriptionsPath
    }`
  );
};

start();

// Start a new Mock Light
new MockLight("Default Mock", config.mqtt);
