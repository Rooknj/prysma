import { graphql, ExecutionResult, GraphQLSchema } from "graphql";
import { ExecutionResultDataDefault } from "graphql/execution/execute";
import { Maybe } from "type-graphql";
import { createSchema } from "../../src/lib/createSchema";

interface Options {
  source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variableValues?: Maybe<{ [key: string]: any }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextValue?: any;
}

let schema: GraphQLSchema;

export const executeGraphql = async ({
  source,
  variableValues,
  contextValue,
}: Options): Promise<ExecutionResult<ExecutionResultDataDefault>> => {
  if (!schema) {
    schema = await createSchema();
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue,
  });
};
