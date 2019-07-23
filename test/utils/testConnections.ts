import path from "path";
import { createConnection, Connection } from "typeorm";
import { AsyncMqttClient } from "async-mqtt";
import { PubSub } from "graphql-subscriptions";
import Mqtt from "../../src/lib/clients/Mqtt";
import GqlPubSub from "../../src/lib/clients/GqlPubSub";
import { Light } from "../../src/light/LightEntity";

export const testDbConnection = (drop: boolean = false): Promise<Connection> =>
  createConnection({
    type: "sqlite",
    database: path.join(__dirname, "..", "..", ".prysma", "test.db"),
    synchronize: drop,
    dropSchema: drop,
    entities: [Light],
  });

export const testMqttClient = (): AsyncMqttClient =>
  Mqtt.createClient({
    host: "tcp://localhost:1883",
  });

export const testGqlPubSub = (): PubSub => GqlPubSub.createClient();
