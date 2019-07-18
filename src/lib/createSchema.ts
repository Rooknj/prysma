import path from "path";
import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { LightResolver } from "../light/LightResolver";

export const createSchema = (pubSub: PubSub): Promise<GraphQLSchema> =>
  buildSchema({
    resolvers: [LightResolver],
    // Automatically create `schema.gql` file with schema definition in current folder if not running from a pkg executable
    // Don't create the schema file if running from a pkg executable
    emitSchemaFile:
      process.env.NODE_ENV === "development" ? path.resolve(__dirname, "..", "schema.gql") : false,
    // Use our custom PubSub system
    pubSub,
  });
