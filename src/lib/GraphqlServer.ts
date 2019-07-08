import { ApolloServer } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import Server from "./Server";

class GraphqlServer extends Server {
  protected apolloServer: ApolloServer;

  public constructor(port: string | number, schema: GraphQLSchema) {
    super(port);
    // Create GraphQL server
    this.apolloServer = new ApolloServer({
      schema,
      // enable GraphQL Playground
      playground: true,
    });

    this.apolloServer.applyMiddleware({ app: this.app });
    this.apolloServer.installSubscriptionHandlers(this.server);
  }

  public start(): void {
    this.server.listen(this.port, (): void => {
      const { graphqlPath, subscriptionsPath } = this.apolloServer;
      console.log(`🖥  UI ready at http://localhost:${this.port}`);
      console.log(`🚀 Server ready at http://localhost:${this.port}${graphqlPath}`);
      console.log(`🚀 Subscriptions ready at ws://localhost:${this.port}${subscriptionsPath}`);
    });
  }
}

export default GraphqlServer;
