import { Connection } from "typeorm";
import { AsyncMqttClient } from "async-mqtt";
import { GraphQLError } from "graphql";
import { testDbConnection, testMqttClient, testGqlPubSub } from "../utils/testConnections";
import { executeGraphql } from "../utils/executeGraphql";
import { generateFakeLightId } from "../utils/generateFakeLightId";

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
    // Close all connections and the mock light
    await Promise.all([conn.close(), mqttClient.end()]);
  }
);

const addMutation = `
mutation addLight($id: String!) {
  addLight(id: $id) {
    id
  }
}
`;

const removeMutation = `
mutation removeLight($id: String!) {
  removeLight(id: $id) {
    id
  }
}
`;

const lightQuery = `
query light($id: String!) {
  light(id: $id) {
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

describe("lightQuery", (): void => {
  test("You can get a light that is currently added", async (): Promise<void> => {
    const lightId = generateFakeLightId();
    await executeGraphql({
      source: addMutation,
      variableValues: {
        id: lightId,
      },
    });

    const response = await executeGraphql({
      source: lightQuery,
      variableValues: {
        id: lightId,
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        light: {
          id: lightId,
          name: lightId,
          connected: expect.any(Boolean),
          on: expect.any(Boolean),
          brightness: expect.any(Number),
          color: expect.any(String),
          effect: expect.any(String),
          speed: expect.any(Number),
          supportedEffects: expect.any(Array),
          ipAddress: expect.any(String),
          macAddress: expect.any(String),
          numLeds: expect.any(Number),
          udpPort: expect.any(Number),
          version: expect.any(String),
          hardware: expect.any(String),
          colorOrder: expect.any(String),
          stripType: expect.any(String),
        },
      })
    );
  });

  test("You can not get a light that is not currently added", async (): Promise<void> => {
    const lightId = generateFakeLightId();
    const response = await executeGraphql({
      source: lightQuery,
      variableValues: {
        id: lightId,
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.data).toBeNull();
    expect(response.errors).toContainEqual(expect.any(GraphQLError));
  });

  test("you can't get a light after it is removed", async (): Promise<void> => {
    const lightId = generateFakeLightId();
    await executeGraphql({
      source: addMutation,
      variableValues: {
        id: lightId,
      },
    });

    await executeGraphql({
      source: removeMutation,
      variableValues: {
        id: lightId,
      },
    });

    const response = await executeGraphql({
      source: lightQuery,
      variableValues: {
        id: lightId,
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.data).toBeNull();
    expect(response.errors).toContainEqual(expect.any(GraphQLError));
  });
});
