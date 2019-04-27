"use strict";
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

class Server {
  constructor() {
    const context = async () => ({});
    const apolloServer = new ApolloServer({ typeDefs, resolvers, context });
    this.graphqlPath = apolloServer.graphqlPath;
    this.subscriptionsPath = apolloServer.subscriptionsPath;

    this.app = express();
    apolloServer.applyMiddleware({ app: this.app });
  }

  start(port) {
    return new Promise(resolve => {
      this.app.listen(port, resolve);
    });
  }
}

module.exports = Server;
