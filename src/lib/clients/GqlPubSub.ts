import { PubSub, PubSubOptions } from "graphql-subscriptions";
import logger from "../logger";
import { ClientSingleton } from "./ClientSingleton";

let gqlPubSub: PubSub;

export default class GqlPubSub extends ClientSingleton {
  public static createClient(options?: PubSubOptions): PubSub {
    if (gqlPubSub) {
      throw new Error("Trying to init graphqlSubscriptionsPubSub again!");
    }

    logger.info(`Connecting to Graphql Subscriptions PubSub...`);
    gqlPubSub = new PubSub(options);
    logger.info(`Connected to Graphql Subscriptions PubSub`);

    return gqlPubSub;
  }

  public static getClient(): PubSub {
    if (!gqlPubSub)
      throw new Error(
        "graphqlSubscriptionsPubSub has not been initialized. Please call init first."
      );
    return gqlPubSub;
  }
}
