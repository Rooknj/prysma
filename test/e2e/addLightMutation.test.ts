import { Connection } from "typeorm";
import { AsyncMqttClient } from "async-mqtt";
import { testDbConnection, testMqttClient, testGqlPubSub } from "../utils/testConnections";
import { executeGraphql } from "../utils/executeGraphql";
import { MockLight, LightState } from "../../src/light/MockLight";
import { PowerState } from "../../src/light/message-types";

// TODO: Setup ability to create and start MockLights (maybe add a mockLight reset function)
// TODO: Setup ability to pass in LightService as context?

const MOCK_LIGHT_ID = "Prysma-Mock";
const MOCK_LIGHT_INITIAL_STATE: LightState = {
  state: PowerState.off,
  color: { r: 255, g: 100, b: 0 },
  brightness: 100,
  effect: "None",
  speed: 4,
};

let conn: Connection;
let mqttClient: AsyncMqttClient;
let mockLight: MockLight;
beforeAll(
  async (): Promise<void> => {
    // Initialize all of our outside connections (the clients and connections are all stored in singletons)
    conn = await testDbConnection();
    mqttClient = testMqttClient();
    testGqlPubSub();

    // Initialize the mock light
    mockLight = new MockLight(
      MOCK_LIGHT_ID,
      { host: "tcp://localhost:1883" },
      MOCK_LIGHT_INITIAL_STATE
    );
  }
);

afterAll(
  async (): Promise<void> => {
    // Close all connections and the mock light
    await Promise.all([conn.close(), mqttClient.end(), mockLight.end()]);
  }
);

afterEach(
  async (): Promise<void> => {
    // Reset the state of the mock light
    mockLight.setState(MOCK_LIGHT_INITIAL_STATE);
    // Clear the db after each test
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

describe("addLight Mutation", (): void => {
  test("You can add a light", async (): Promise<void> => {
    const lightId = "Prysma-Mock1";

    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock1",
      },
    });

    console.log(response.data.addLight);
    expect(response.errors).toBeUndefined();
    expect(response.data.addLight).toBeDefined();
    expect(response.data.addLight).toBe(
      expect.objectContaining({
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
      })
    );
    console.log(response);
  });

  test("You can not add a light twice", async (): Promise<void> => {
    await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock2",
      },
    });

    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: "Prysma-Mock2",
      },
    });

    console.log(response);
  });

  test("Adding a connected light returns current state/config instead of default", async (): Promise<
    void
  > => {
    const response = await executeGraphql({
      source: addMutation,
      variableValues: {
        id: MOCK_LIGHT_ID,
      },
    });
    console.log(response);
  });
});
