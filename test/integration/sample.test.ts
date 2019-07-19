import { Connection } from "typeorm";
import { AsyncMqttClient } from "async-mqtt";
import { testDbConnection, testMqttClient, testGqlPubSub } from "../utils/testConnections";
import { executeGraphql } from "../utils/executeGraphql";

let conn: Connection;
let mqttClient: AsyncMqttClient;
beforeAll(
  async (): Promise<void> => {
    // Initialize all of our outside connections (the clients and connections are all stored in singletons)
    conn = await testDbConnection();
    mqttClient = testMqttClient();
    testGqlPubSub();
  }
);

afterAll(
  async (): Promise<void> => {
    // Close all connections
    await Promise.all([conn.close(), mqttClient.end()]);
  }
);

// Clear the db after each test
afterEach(
  async (): Promise<void> => {
    await conn.synchronize(true);
  }
);

const addMutation = `
mutation addLight($id: String!) {
  addLight(id: $id) {
    id
    name
    connected
    on
    brightness
    color
    effect
    speed
    supportedEffects
    ipAddress
    macAddress
    numLeds
    udpPort
    version
    hardware
    colorOrder
    stripType
  }
}
`;

describe("tests", (): void => {
  test("does something", async (): Promise<void> => {
    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock1",
      },
    });
    console.log(response);
  });

  test("does something 2", async (): Promise<void> => {
    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock2",
      },
    });
    console.log(response);
  });
  test("does something 3", async (): Promise<void> => {
    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock3",
      },
    });
    console.log(response);
  });
  test("does something 4", async (): Promise<void> => {
    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock4",
      },
    });
    console.log(response);
  });
  test("does something 5", async (): Promise<void> => {
    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock5",
      },
    });
    console.log(response);
  });
});
