"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const config = require("./config");
const Server = require("./server");
const packageJson = require("../package.json");

// Verbose statement of service starting
const { version } = packageJson;
console.log(`--- Prysma v${version} ---`);

// Unhandled error logging
process.on("uncaughtException", err => {
  console.log("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  console.log("Unhandled Rejection", err);
});

const server = new Server();

server.start(config.server.port).then(() => {
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
});

const PrysmaMqtt = require("./services/prysmaMqtt");

const prysmaMqtt = new PrysmaMqtt();
prysmaMqtt.connect(config.mqtt.host, config.mqtt.topics, config.mqtt.options);
prysmaMqtt.once("connect", async () => {
  await prysmaMqtt.subscribeToLight("test");
  await prysmaMqtt.unsubscribeFromLight("test");
});
