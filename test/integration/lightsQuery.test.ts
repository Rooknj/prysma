import { Connection } from "typeorm";
import { AsyncMqttClient } from "async-mqtt";
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

const lightsQuery = `
query lights {
  lights{
    id
    name
  }
}
`;

describe("lightsQuery", (): void => {
  test("You can get a list of lights that are currently added (one light)", async (): Promise<
    void
  > => {
    const lightId = generateFakeLightId();
    await executeGraphql({
      source: addMutation,
      variableValues: {
        id: lightId,
      },
    });

    const response = await executeGraphql({
      source: lightsQuery,
      variableValues: {
        id: lightId,
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        lights: expect.arrayContaining([
          expect.objectContaining({
            id: lightId,
            name: lightId,
          }),
        ]),
      })
    );
  });

  test("The light doesn't show up in the lights query after it is removed", async (): Promise<
    void
  > => {
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
      source: lightsQuery,
      variableValues: {
        id: lightId,
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        lights: expect.not.arrayContaining([
          expect.objectContaining({
            id: lightId,
            name: lightId,
          }),
        ]),
      })
    );
  });

  // TODO: Figure out how to do this with the current parallel setup (or if we even need it)
  test.todo("Data is empty if no lights are added");
});
