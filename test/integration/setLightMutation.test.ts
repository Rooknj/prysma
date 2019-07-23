import { Connection } from "typeorm";
import { AsyncMqttClient } from "async-mqtt";
import { GraphQLError } from "graphql";
import { generateFakeLightId } from "../utils/generateFakeLightId";
import { testDbConnection, testMqttClient, testGqlPubSub } from "../utils/testConnections";
import { executeGraphql } from "../utils/executeGraphql";
import { MockLight, LightState } from "../../src/light/MockLight";
import { PowerState } from "../../src/light/message-types";

const MOCK_LIGHT_ID = "Prysma-setLightMock";
const MOCK_LIGHT_INITIAL_STATE: LightState = {
  state: PowerState.off,
  color: { r: 255, g: 255, b: 0 },
  brightness: 100,
  effect: "None",
  speed: 4,
};

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

    // Add the light
    await executeGraphql({
      source: addMutation,
      variableValues: {
        id: MOCK_LIGHT_ID,
      },
    });
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
  }
);

const setLightMutation = `
mutation setLight($id: String!, $lightData: LightInput!) {
  setLight(id: $id, lightData: $lightData) {
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

describe("setLightMutation", (): void => {
  test("You can turn a light on", async (): Promise<void> => {
    const lightId = MOCK_LIGHT_ID;
    const ON = true;

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { on: ON },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        setLight: expect.objectContaining({
          id: lightId,
          name: lightId,
          connected: true,
          on: ON,
        }),
      })
    );
  });

  test("You can turn a light off", async (): Promise<void> => {
    const lightId = MOCK_LIGHT_ID;
    mockLight.setState({ ...MOCK_LIGHT_INITIAL_STATE, state: PowerState.on });
    const ON = false;

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { on: ON },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        setLight: expect.objectContaining({
          id: lightId,
          name: lightId,
          connected: true,
          on: ON,
        }),
      })
    );
  });

  test("You can change a light's brightness", async (): Promise<void> => {
    const lightId = MOCK_LIGHT_ID;
    const BRIGHTNESS = 69;

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { brightness: BRIGHTNESS },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        setLight: expect.objectContaining({
          id: lightId,
          name: lightId,
          connected: true,
          brightness: BRIGHTNESS,
        }),
      })
    );
  });

  test("You can change a light's color", async (): Promise<void> => {
    const lightId = MOCK_LIGHT_ID;
    const COLOR = "#FF6900";

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { color: COLOR },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        setLight: expect.objectContaining({
          id: lightId,
          name: lightId,
          connected: true,
          color: COLOR,
        }),
      })
    );
  });

  test("You can change a light's effect", async (): Promise<void> => {
    const lightId = MOCK_LIGHT_ID;
    const EFFECT = "Test 1";

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { effect: EFFECT },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        setLight: expect.objectContaining({
          id: lightId,
          name: lightId,
          connected: true,
          effect: EFFECT,
        }),
      })
    );
  });

  test("You can change a light's speed", async (): Promise<void> => {
    const lightId = MOCK_LIGHT_ID;
    const SPEED = 2;

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { speed: SPEED },
      },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.data).toEqual(
      expect.objectContaining({
        setLight: expect.objectContaining({
          id: lightId,
          name: lightId,
          connected: true,
          speed: SPEED,
        }),
      })
    );
  });

  test("you can't change a light that isn't currently added", async (): Promise<void> => {
    const lightId = generateFakeLightId();

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { on: true },
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.data).toBeNull();
    expect(response.errors).toContainEqual(expect.any(GraphQLError));
  });

  test("you can't change a light that isn't connected", async (): Promise<void> => {
    const lightId = generateFakeLightId();

    // Add the light
    await executeGraphql({
      source: addMutation,
      variableValues: {
        id: lightId,
      },
    });

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { on: true },
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.data).toBeNull();
    expect(response.errors).toContainEqual(expect.any(GraphQLError));
  });

  test("you can't change a light after it is removed", async (): Promise<void> => {
    const lightId = generateFakeLightId();

    // Add the light
    await executeGraphql({
      source: addMutation,
      variableValues: {
        id: lightId,
      },
    });

    // remove the light
    await executeGraphql({
      source: removeMutation,
      variableValues: {
        id: lightId,
      },
    });

    const response = await executeGraphql({
      source: setLightMutation,
      variableValues: {
        id: lightId,
        lightData: { on: true },
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.data).toBeNull();
    expect(response.errors).toContainEqual(expect.any(GraphQLError));
  });
});
