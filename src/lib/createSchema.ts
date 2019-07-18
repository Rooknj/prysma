import path from "path";
import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { LightResolver } from "../light/LightResolver";
import GqlPubSub from "./clients/GqlPubSub";

export const createSchema = (): Promise<GraphQLSchema> =>
  buildSchema({
    resolvers: [LightResolver],
    // Automatically create `schema.gql` file with schema definition in current folder if not running from a pkg executable
    // Don't create the schema file if running from a pkg executable
    emitSchemaFile:
      process.env.NODE_ENV === "development" ? path.resolve(__dirname, "..", "schema.gql") : false,
    // Use our custom PubSub system
    pubSub: GqlPubSub.getClient(),
  });
