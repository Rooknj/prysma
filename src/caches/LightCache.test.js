const LightCache = require("./LightCache");

const NO_ID_MESSAGE = "No ID provided";
const NO_STATE_MESSAGE = "No State provided";

describe("getLightState", () => {
  test("gets the light's state", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: true,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5
    };
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    const lightState = await lightCache.getLightState(LIGHT_ID);

    expect(lightState).toEqual(LIGHT_STATE);
  });
  test("throws an error if no id was provided", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: true,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5
    };
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    try {
      await lightCache.getLightState();
    } catch (error) {
      expect(error.message).toBe(NO_ID_MESSAGE);
      expect(error).toBeInstanceOf(Error);
    }
  });
  test("throws an error if no light state exists", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";

    try {
      await lightCache.getLightState(LIGHT_ID);
    } catch (error) {
      expect(error.message).toBe(`${LIGHT_ID}'s state not found in cache`);
      expect(error).toBeInstanceOf(Error);
    }
  });
  test("throws an error if lightState fails validation", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: 12354,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5
    };
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    try {
      await lightCache.getLightState(LIGHT_ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
  test("throws an error if lightState is empty", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {};
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    try {
      await lightCache.getLightState(LIGHT_ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe("setLightState", () => {
  test("sets the light's state", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: true,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5
    };

    await lightCache.setLightState(LIGHT_ID, LIGHT_STATE);

    expect(lightCache._lightStates[LIGHT_ID]).toEqual(LIGHT_STATE);
  });
  test("throws an error if no id was provided", async () => {
    const lightCache = new LightCache();

    try {
      await lightCache.setLightState();
    } catch (error) {
      expect(error.message).toBe(NO_ID_MESSAGE);
      expect(error).toBeInstanceOf(Error);
    }
  });
  test("throws an error if no state was provided", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";

    try {
      await lightCache.setLightState(LIGHT_ID);
    } catch (error) {
      expect(error.message).toBe(NO_STATE_MESSAGE);
      expect(error).toBeInstanceOf(Error);
    }
  });
  test("throws an error if lightState fails validation", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: 12354,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5
    };

    try {
      await lightCache.setLightState(LIGHT_ID, LIGHT_STATE);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
  test("throws an error if lightState is empty", async () => {
    const lightCache = new LightCache();

    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {};

    try {
      await lightCache.setLightState(LIGHT_ID, LIGHT_STATE);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
