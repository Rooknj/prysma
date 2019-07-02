import { PubSub, PubSubOptions } from "graphql-subscriptions";
import logger from "../logger";

let graphqlSubscriptionsPubSub: PubSub;

export const initGraphqlSubscriptionsPubSub = async (
  options: PubSubOptions = {}
): Promise<PubSub> => {
  if (graphqlSubscriptionsPubSub) {
    throw new Error("Trying to init graphqlSubscriptionsPubSub again!");
  }

  logger.info(`Connecting to Graphql Subscriptions PubSub...`);
  graphqlSubscriptionsPubSub = new PubSub(options);
  logger.info(`Connected to Graphql Subscriptions PubSub`);

  return graphqlSubscriptionsPubSub;
};

export const getGraphqlSubscriptionsPubSub = (): PubSub => {
  if (!graphqlSubscriptionsPubSub)
    throw new Error("graphqlSubscriptionsPubSub has not been initialized. Please call init first.");
  return graphqlSubscriptionsPubSub;
};

export const closeGraphqlSubscriptionsPubSub = async (): Promise<void> => {
  if (graphqlSubscriptionsPubSub) {
    logger.info(`Closing Graphql Subscriptions PubSub`);
    return;
  }
  logger.info(`graphqlSubscriptionsPubSub has not been initialized.`);
};
