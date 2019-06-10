// Enable console log statements in this file
/* eslint no-console:0 */
const http = require("http");
const path = require("path");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers, mocks } = require("./schema");
const config = require("./config");
const packageJson = require("../package.json");
const { initDb, closeDb } = require("./clients/db");
const { initMqtt, closeMqtt } = require("./clients/mqtt");
const LightService = require("./services/lightService/LightService");
const SubscriptionService = require("./services/subscriptionService/SubscriptionService");
const MockLight = require("./lib/MockLight");
const health = require("./routes/health");
const logger = require("./lib/logger");

// Verbose statement of service starting
const { version } = packageJson;
console.log(`--- Prysma v${version} ---`);

// Unhandled error logging
process.on("uncaughtException", err => {
  logger.error("Unhandled Exception", err);
  process.exit(1);
});
process.on("unhandledRejection", err => {
  logger.error("Unhandled Rejection", err);
  process.exit(1);
});

// listen for the signal interruption (ctrl-c)
// Close redis, close sequelize if needed, close MQTT client, log that it is closing
process.on("SIGINT", async () => {
  logger.info("SIGINT signal received, shutting down gracefully...");
  const closePromises = [closeDb(), closeMqtt()];
  await Promise.all(closePromises);
  logger.info("Successfully shut down. Goodbye");
  process.exit(0);
});

const init = async () => {
  let services = null;

  // Initialize all client connections (like database connection)
  if (!process.env.MOCK) {
    logger.info("Initializing Clients...");
    const clientPromises = [initDb(config.db), initMqtt(config.mqtt.host, config.mqtt.options)];
    await Promise.all(clientPromises);
    logger.info("Clients Initialized");

    // Initialize our services
    logger.info("Initializing Services...");
    const lightService = new LightService(config);
    const subscriptionService = new SubscriptionService();
    const serviceInitPromises = [lightService.init(), subscriptionService.init()];
    await Promise.all(serviceInitPromises);
    services = { lightService, subscriptionService };
    logger.info("Services Initialized");
  }
  return services;
};

const start = async services => {
  const app = express();

  app.get("/health/full", health.full);
  app.get("/health/version", health.version);
  app.disable("x-powered-by");
  app.use("/", express.static(path.join(__dirname, "..", "ui")));

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: { ...services },
    mocks: process.env.MOCK ? mocks : false,
  });
  const { graphqlPath, subscriptionsPath } = apolloServer;
  apolloServer.applyMiddleware({ app });

  const server = http.createServer(app);
  apolloServer.installSubscriptionHandlers(server);

  // Start the server
  logger.info("Starting Server...");
  server.listen(config.server.port, () => {
    console.log(`🖥  UI ready at http://localhost:${config.server.port}`);
    console.log(`🚀 Server ready at http://localhost:${config.server.port}${graphqlPath}`);
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${config.server.port}${subscriptionsPath}`
    );
  });
};

module.exports = init()
  .then(services => {
    // Start the server
    start(services);

    // Start a new Mock Light
    // eslint-disable-next-line no-new
    new MockLight("Prysma-Mock", config.mqtt);
  })
  .catch(err => {
    logger.error(err, "Service failed to initialize");
    process.exit(1);
  });
