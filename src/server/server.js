const http = require("http");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const Mocks = require("./mocks");

class Server {
  constructor(services) {
    let mocks = false;
    let context;

    if (process.env.MOCK) {
      mocks = Mocks;
    } else {
      context = () => ({ ...services });
    }

    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context,
      mocks,
    });
    this.graphqlPath = apolloServer.graphqlPath;
    this.subscriptionsPath = apolloServer.subscriptionsPath;

    const app = express();
    apolloServer.applyMiddleware({ app });
    this.httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(this.httpServer);
  }

  start(port) {
    return new Promise(resolve => {
      this.httpServer.listen(port, resolve);
    });
  }
}

module.exports = Server;
