const LightCache = require("./LightCache");
const { ValidationError } = require("../errors");

const NO_ID_MESSAGE = "No ID provided";
const NO_STATE_MESSAGE = "No State provided";

let lightCache;
beforeEach(() => {
  lightCache = new LightCache();
});

describe("getDiscoveredLights", () => {
  let correctDiscoveredLight;
  beforeEach(() => {
    correctDiscoveredLight = {
      id: "Prysma-AABBCCDDEEFF",
      name: "Prysma-AABBCCDDEEFF",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778,
    };
  });
  test("Gets the discovered lights as an array (Example 1)", async () => {
    const correctDiscoveredLight1 = Object.assign({}, correctDiscoveredLight, {
      id: "Prysma-Test",
    });
    const correctDiscoveredLight2 = Object.assign({}, correctDiscoveredLight, {
      id: "Prysma-Test2",
    });
    const DISCOVERED_LIGHTS = [correctDiscoveredLight1, correctDiscoveredLight2];
    lightCache._discoveredLights = DISCOVERED_LIGHTS;
    // const getLightSpy = jest.spyOn(lightCache._discoveredLights, "push");

    const discoveredLights = await lightCache.getDiscoveredLights();
    expect(Array.isArray(discoveredLights)).toBe(true);
    expect(discoveredLights).toEqual(DISCOVERED_LIGHTS);
  });
  test("Gets the discovered lights as an array (Example 2)", async () => {
    const correctDiscoveredLight1 = Object.assign({}, correctDiscoveredLight, {
      id: "Default Mock",
    });
    const correctDiscoveredLight2 = Object.assign({}, correctDiscoveredLight, {
      id: "Hello World Window",
    });
    const DISCOVERED_LIGHTS = [correctDiscoveredLight1, correctDiscoveredLight2];
    lightCache._discoveredLights = DISCOVERED_LIGHTS;

    const discoveredLights = await lightCache.getDiscoveredLights();
    expect(Array.isArray(discoveredLights)).toBe(true);
    expect(discoveredLights).toEqual(DISCOVERED_LIGHTS);
  });
});

describe("clearDiscoveredLights", () => {
  let correctDiscoveredLight;
  beforeEach(() => {
    correctDiscoveredLight = {
      id: "Prysma-AABBCCDDEEFF",
      name: "Prysma-AABBCCDDEEFF",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778,
    };
  });

  test("Clears the discovered lights cache", async () => {
    const discoveredLight = Object.assign({}, correctDiscoveredLight, {
      id: "Default Mock",
    });
    lightCache._discoveredLights = [discoveredLight];

    await lightCache.clearDiscoveredLights();

    expect(lightCache._discoveredLights).toEqual([]);
  });
});

describe("addDiscoveredLight", () => {
  let correctDiscoveredLight;
  beforeEach(() => {
    correctDiscoveredLight = {
      id: "Prysma-AABBCCDDEEFF",
      name: "Prysma-AABBCCDDEEFF",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778,
    };
  });

  test("Correctly adds the discovered light (Example 1)", async () => {
    const discoveredLight = Object.assign({}, correctDiscoveredLight, {
      id: "Default Mock",
    });

    const addLightSpy = jest.spyOn(lightCache._discoveredLights, "push");

    await lightCache.addDiscoveredLight(discoveredLight);
    expect(lightCache._discoveredLights.find(({ id }) => id === discoveredLight.id)).toEqual(
      discoveredLight
    );
    expect(addLightSpy).toBeCalledTimes(1);
    expect(addLightSpy).toBeCalledWith(expect.objectContaining(discoveredLight));
  });
  test("Correctly adds the discovered light (Example 2)", async () => {
    const discoveredLight = Object.assign({}, correctDiscoveredLight, {
      id: "Hello Mock Test WOrld",
      name: "Tester",
      udpPort: 7777,
    });

    const addLightSpy = jest.spyOn(lightCache._discoveredLights, "push");

    await lightCache.addDiscoveredLight(discoveredLight);
    expect(lightCache._discoveredLights.find(({ id }) => id === discoveredLight.id)).toEqual(
      discoveredLight
    );
    expect(addLightSpy).toBeCalledTimes(1);
    expect(addLightSpy).toBeCalledWith(expect.objectContaining(discoveredLight));
  });
  test("Rejects and does not add if no discoveredLight was provided", async () => {
    const addLightSpy = jest.spyOn(lightCache._discoveredLights, "push");

    const messengerPromise = lightCache.addDiscoveredLight();

    await expect(messengerPromise).rejects.toThrow(Error);
    expect(addLightSpy).not.toBeCalled();
  });
  test("Rejects and does not add if the discoveredLight is invalidly formatted", async () => {
    const discoveredLight = Object.assign({}, correctDiscoveredLight, {
      id: "Hello Mock Test WOrld",
      name: 123456,
      udpPort: "Im a port!",
      macAddress: "AAVVCCDD",
    });

    const addLightSpy = jest.spyOn(lightCache._discoveredLights, "push");

    const messengerPromise = lightCache.addDiscoveredLight(discoveredLight);

    await expect(messengerPromise).rejects.toThrow(Error);
    expect(addLightSpy).not.toBeCalled();
  });
  test("Only adds the light once", async () => {
    const addLightSpy = jest.spyOn(lightCache._discoveredLights, "push");
    await lightCache.addDiscoveredLight(correctDiscoveredLight);
    await lightCache.addDiscoveredLight(correctDiscoveredLight);

    expect(addLightSpy).toBeCalledTimes(1);
  });
});

describe("removeDiscoveredLight", () => {
  let correctDiscoveredLight;
  beforeEach(() => {
    correctDiscoveredLight = {
      id: "Prysma-AABBCCDDEEFF",
      name: "Prysma-AABBCCDDEEFF",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778,
    };
  });

  test("Correctly removes the discovered light (Example 1)", async () => {
    const lightToRemove = correctDiscoveredLight.id;

    const removeLightSpy = jest.spyOn(lightCache._discoveredLights, "filter");

    await lightCache.removeDiscoveredLight(lightToRemove);

    expect(removeLightSpy).toBeCalledTimes(1);
    expect(removeLightSpy).toBeCalledWith(expect.anything());
  });
  // test("Correctly removes the discovered light (Example 2)", async () => {});
  test("Does not reject if the light was already removed/doesnt exist", async () => {
    const lightToRemove = "This isnt added";

    await expect(lightCache.removeDiscoveredLight(lightToRemove)).resolves;
  });
  test("Rejects if no lightId is passed in", async () => {
    await expect(lightCache.removeDiscoveredLight()).rejects.toThrow(Error);
  });
});

describe("getLightState", () => {
  test("gets the light's state", async () => {
    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: true,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5,
    };
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    const lightState = await lightCache.getLightState(LIGHT_ID);

    expect(lightState).toEqual(Object.assign({}, LIGHT_STATE, { id: LIGHT_ID }));
  });
  test("Rejects if no id was provided", async () => {
    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      id: LIGHT_ID,
      on: true,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5,
    };
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    const cachePromise = lightCache.getLightState();

    await expect(cachePromise).rejects.toThrow(NO_ID_MESSAGE);
  });
  test("Rejects if no light state exists", async () => {
    const LIGHT_ID = "mockLight";

    const cachePromise = lightCache.getLightState(LIGHT_ID);

    await expect(cachePromise).rejects.toThrow(`${LIGHT_ID}'s state not found in cache`);
  });
  test("Rejects if lightState is empty", async () => {
    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {};
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    const cachePromise = lightCache.getLightState(LIGHT_ID);

    await expect(cachePromise).rejects.toThrow(`${LIGHT_ID}'s state not found in cache`);
  });
});

describe("setLightState", () => {
  test("sets the light's state", async () => {
    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: true,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5,
    };

    await lightCache.setLightState(LIGHT_ID, LIGHT_STATE);

    expect(lightCache._lightStates[LIGHT_ID]).toEqual(LIGHT_STATE);
  });
  test("Rejects if no id was provided", async () => {
    const cachePromise = lightCache.setLightState();

    await expect(cachePromise).rejects.toThrow(NO_ID_MESSAGE);
  });
  test("Rejects if no state was provided", async () => {
    const LIGHT_ID = "mockLight";

    const cachePromise = lightCache.setLightState(LIGHT_ID);

    await expect(cachePromise).rejects.toThrow(NO_STATE_MESSAGE);
  });
  test("Rejects if lightState fails validation", async () => {
    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: 12354,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5,
    };

    const cachePromise = lightCache.setLightState(LIGHT_ID, LIGHT_STATE);

    await expect(cachePromise).rejects.toThrow(ValidationError);
  });
  test("Rejects if lightState is empty", async () => {
    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {};

    const cachePromise = lightCache.setLightState(LIGHT_ID, LIGHT_STATE);

    await expect(cachePromise).rejects.toThrow(NO_STATE_MESSAGE);
  });
});

describe("initializeLightState", () => {
  test("sets the light to the defaunt light state", async () => {
    const LIGHT_ID = "mockLight";

    await lightCache.initializeLightState(LIGHT_ID);

    expect(lightCache._lightStates[LIGHT_ID]).toEqual(lightCache.DEFAULT_LIGHT_STATE);
  });
});

describe("clearLightState", () => {
  test("Clears the light's state", async () => {
    const LIGHT_ID = "mockLight";
    const LIGHT_STATE = {
      on: true,
      color: { r: 255, g: 43, b: 2 },
      brightness: 22,
      effect: "None",
      speed: 5,
    };
    lightCache._lightStates[LIGHT_ID] = LIGHT_STATE;

    await lightCache.clearLightState(LIGHT_ID);

    expect(lightCache._lightStates[LIGHT_ID]).toBeUndefined();
  });
});
