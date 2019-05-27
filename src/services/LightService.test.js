const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");
const mediator = require("./mediator");
const utils = require("../utils/lightUtils");
const {
  TIMEOUT_WAIT,
  MUTATION_RESPONSE_EVENT,
  LIGHT_ADDED_EVENT,
  LIGHT_REMOVED_EVENT,
  LIGHT_CHANGED_EVENT,
  LIGHT_STATE_CHANGED_EVENT
} = require("./serviceConstants");
const LightService = require("./LightService");

// Generate auto mocks for these module
jest.mock("../messengers/LightMessenger");
jest.mock("../daos/LightDao");
jest.mock("../caches/LightCache");
jest.mock("../utils/lightUtils");

const MOCK_LIGHT_STATE = {
  connected: true,
  on: false,
  color: { r: 255, g: 255, b: 255 },
  brightness: 100,
  effect: "None",
  speed: 4,
  id: "Prysma-84F3EBB45500"
};

const MOCK_LIGHTS = [
  {
    id: "Prysma-84F3EBB45500",
    name: "Prysma-84F3EBB45500",
    supportedEffects: [
      "Flash",
      "Fade",
      "Rainbow",
      "Cylon",
      "Sinelon",
      "Confetti",
      "BPM",
      "Juggle",
      "Visualize",
      "Dots",
      "Fire",
      "Lightning",
      "Noise"
    ],
    ipAddress: "10.0.0.114",
    macAddress: "84:F3:EB:B4:55:00",
    numLeds: 60,
    udpPort: 7778,
    version: "1.0.0",
    hardware: "8266",
    colorOrder: "GRB",
    stripType: "WS2812B",
    rank: null
  },
  {
    id: "Prysma-Mock",
    name: "Prysma-Mock",
    supportedEffects: ["Test 1", "Test 2", "Test 3"],
    ipAddress: "10.0.0.1",
    macAddress: "AA:BB:CC:DD:EE:FF",
    numLeds: 60,
    udpPort: 7778,
    version: "1.0.0-mock",
    hardware: "MockHardware",
    colorOrder: "RGB",
    stripType: "MockStrip",
    rank: null
  },
  {
    id: "Default Mock",
    name: "Default Mock",
    supportedEffects: ["Test 1", "Test 2", "Test 3"],
    ipAddress: null,
    macAddress: null,
    numLeds: null,
    udpPort: null,
    version: null,
    hardware: null,
    colorOrder: null,
    stripType: null,
    rank: null
  }
];
const MOCK_LIGHT = MOCK_LIGHTS[0];

const mediatorEmitSpy = jest.spyOn(mediator, "emit");
const mediatorRemoveListenerSpy = jest.spyOn(mediator, "removeListener");
beforeAll(() => {
  // Override getLights automock value
  LightDao.prototype.getLights = jest.fn(() => MOCK_LIGHTS);
});

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  LightMessenger.mockClear();
  LightDao.mockClear();
  LightCache.mockClear();
  mediatorEmitSpy.mockClear();
  mediatorRemoveListenerSpy.mockClear();
});

describe("constructor", () => {
  test("Initializes the messenger", () => {
    const lightService = new LightService();

    expect(LightMessenger).toHaveBeenCalledTimes(1);
    expect(lightService._messenger).toBeDefined();
  });
  test("Initializes the dao", () => {
    const lightService = new LightService();

    expect(LightDao).toHaveBeenCalledTimes(1);
    expect(lightService._dao).toBeDefined();
  });
  test("Initializes the cache", () => {
    const lightService = new LightService();

    expect(LightCache).toHaveBeenCalledTimes(1);
    expect(lightService._cache).toBeDefined();
  });
});

describe("init", () => {
  test("Initializes the cache with default light states for all added lights", async () => {
    const lightService = new LightService();
    lightService._cache.initializeLightState = jest.fn();
    await lightService.init();

    MOCK_LIGHTS.forEach(({ id }) => {
      expect(lightService._cache.initializeLightState).toBeCalledWith(id);
    });
  });
  test("handles messenger connect if the messenger is already connected", async () => {
    const lightService = new LightService();
    lightService._handleMessengerConnect = jest.fn();
    lightService._messenger.connected = true;

    await lightService.init();

    expect(lightService._handleMessengerConnect).toBeCalled();
  });
  test("does not handle messenger connect if the messenger is not already connected", async () => {
    const lightService = new LightService();
    lightService._handleMessengerConnect = jest.fn();
    lightService._messenger.connected = false;

    await lightService.init();

    expect(lightService._handleMessengerConnect).not.toBeCalled();
  });
  test("Sets a messenger connect listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "connect",
      expect.any(Function)
    );
  });
  test("Sets a messenger connectedMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "connectedMessage",
      expect.any(Function)
    );
  });
  test("Sets a messenger stateMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "stateMessage",
      expect.any(Function)
    );
  });
  test("Sets a messenger effectListMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "effectListMessage",
      expect.any(Function)
    );
  });
  test("Sets a messenger discoveryMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "discoveryMessage",
      expect.any(Function)
    );
  });
});

describe("getLight", () => {
  test("Returns a light from the database", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";

    const light = await lightService.getLight(ID);

    expect(lightService._dao.getLight).toBeCalledWith(ID);
    expect(light).toBe(MOCK_LIGHT);
  });
  test("Rejects if it cant get the light", async () => {
    const lightService = new LightService();
    const ERROR_MESSAGE = "Mock Error";
    lightService._dao.getLight = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-12345";

    const servicePromise = lightService.getLight(ID);

    await expect(servicePromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe("getLights", () => {
  test("Returns the lights from the database", async () => {
    const lightService = new LightService();
    lightService._dao.getLights = jest.fn(() => MOCK_LIGHTS);

    const lights = await lightService.getLights();

    expect(lightService._dao.getLights).toBeCalled();
    expect(lights).toBe(MOCK_LIGHTS);
  });
  test("Rejects if it cant get the lights", async () => {
    const lightService = new LightService();
    const ERROR_MESSAGE = "Mock Error";
    lightService._dao.getLights = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });

    const servicePromise = lightService.getLights();

    await expect(servicePromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe.skip("getDiscoveredLights", () => {
  test("does a thing", async () => {});
});

describe("setLight", () => {
  test("sets the light to the new data in the database", async () => {
    const lightService = new LightService();
    lightService._dao.setLight = jest.fn();
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    await lightService.setLight(ID, DATA);

    expect(lightService._dao.setLight).toBeCalledWith(ID, DATA);
  });
  test("returns the set light from the database", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    const changedLight = await lightService.setLight(ID, DATA);

    expect(lightService._dao.getLight).toBeCalledWith(ID);
    expect(changedLight).toBe(MOCK_LIGHT);
  });
  test("notifies listeners about the new light", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    await lightService.setLight(ID, DATA);

    expect(mediatorEmitSpy).toBeCalledWith(LIGHT_CHANGED_EVENT, MOCK_LIGHT);
  });
  test("does not notify listeners about the changed light if it cant set the light", async () => {
    const lightService = new LightService();
    lightService._dao.setLight = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    const servicePromise = lightService.setLight(ID, DATA);

    await expect(servicePromise).rejects.toThrow(Error);
    expect(mediatorEmitSpy).not.toBeCalled();
  });
  test("does not notify listeners about the changed light if it cant retrieve the set light", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    const servicePromise = lightService.setLight(ID, DATA);

    await expect(servicePromise).rejects.toThrow(Error);
    expect(mediatorEmitSpy).not.toBeCalled();
  });
  test("rejects if setting the light fails", async () => {
    const lightService = new LightService();
    const ERROR_MESSAGE = "Mock Error";
    lightService._dao.setLight = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    const servicePromise = lightService.setLight(ID, DATA);

    await expect(servicePromise).rejects.toThrow(ERROR_MESSAGE);
  });
  test("rejects if retrieving the set light fails", async () => {
    const lightService = new LightService();
    const ERROR_MESSAGE = "Mock Error";
    lightService._dao.getLight = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    const servicePromise = lightService.setLight(ID, DATA);

    await expect(servicePromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe("addLight", () => {
  test("Adds the light to the database", async () => {
    const lightService = new LightService();
    lightService._dao.addLight = jest.fn();
    const ID = "Prysma-789";

    await lightService.addLight(ID);

    expect(lightService._dao.addLight).toBeCalledWith(ID, undefined);
  });
  test("Adds the light to the database with the specified data", async () => {
    const lightService = new LightService();
    lightService._dao.addLight = jest.fn();
    const ID = "Prysma-789";
    const DATA = { name: "Desk Lamp" };

    await lightService.addLight(ID, DATA);

    expect(lightService._dao.addLight).toBeCalledWith(ID, DATA.name);
  });
  test("Initializes the light's state in the cache", async () => {
    const lightService = new LightService();
    lightService._cache.initializeLightState = jest.fn();
    const ID = "Prysma-789";

    await lightService.addLight(ID);

    expect(lightService._cache.initializeLightState).toBeCalledWith(ID);
  });
  test("Removes the light from the discoveredLights cache", async () => {
    const lightService = new LightService();
    lightService._cache.removeDiscoveredLight = jest.fn();
    const ID = "Prysma-789";

    await lightService.addLight(ID);

    expect(lightService._cache.removeDiscoveredLight).toBeCalledWith(ID);
  });
  test("Subscribes to the new light", async () => {
    const lightService = new LightService();
    lightService._messenger.subscribeToLight = jest.fn();
    const ID = "Prysma-789";

    await lightService.addLight(ID);

    expect(lightService._messenger.subscribeToLight).toBeCalledWith(ID);
  });
  test("returns the newly added light", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-789";

    const lightAdded = await lightService.addLight(ID);

    expect(lightAdded).toBe(MOCK_LIGHT);
  });
  test("notifies listeners about the new light", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-789";

    await lightService.addLight(ID);

    expect(mediatorEmitSpy).toBeCalledWith(LIGHT_ADDED_EVENT, MOCK_LIGHT);
  });
  test("does not notify listeners about the new light if it fails to add the light to the database", async () => {
    const lightService = new LightService();
    lightService._dao.addLight = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-789";

    const servicePromise = lightService.addLight(ID);

    await expect(servicePromise).rejects.toThrow(Error);
    expect(mediatorEmitSpy).not.toBeCalled();
  });
  test("rejects if it fails to add the light to the database", async () => {
    const lightService = new LightService();
    const ERROR_MESSAGE = "Mock Error";
    lightService._dao.addLight = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-789";

    const servicePromise = lightService.addLight(ID);

    await expect(servicePromise).rejects.toThrow(ERROR_MESSAGE);
  });
  test("does not reject if it fails to initialize the cache", async () => {
    const lightService = new LightService();
    lightService._cache.initializeLightState = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-789";

    await lightService.addLight(ID);
  });
  test("does not reject if it fails to remove the light from discoveredLights", async () => {
    const lightService = new LightService();
    lightService._cache.removeDiscoveredLight = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-789";

    await lightService.addLight(ID);
  });
  test("does not reject if it fails subscribe to the light", async () => {
    const lightService = new LightService();
    lightService._messenger.subscribeToLight = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-789";

    await lightService.addLight(ID);
  });
});

describe("removeLight", () => {
  test("Removes the light from the database", async () => {
    const lightService = new LightService();
    lightService._dao.removeLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";

    await lightService.removeLight(ID);

    expect(lightService._dao.removeLight).toBeCalledWith(ID);
  });
  test("Returns the removed light", async () => {
    const lightService = new LightService();
    lightService._dao.removeLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";

    const removedLight = await lightService.removeLight(ID);

    expect(removedLight).toBe(MOCK_LIGHT);
  });
  test("Notifies listeners of the removed light", async () => {
    const lightService = new LightService();
    lightService._dao.removeLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";

    await lightService.removeLight(ID);

    expect(mediatorEmitSpy).toBeCalledWith(LIGHT_REMOVED_EVENT, MOCK_LIGHT);
  });
  test("clears the light's state", async () => {
    const lightService = new LightService();
    lightService._cache.clearLightState = jest.fn();
    const ID = "Prysma-12345";

    await lightService.removeLight(ID);

    expect(lightService._cache.clearLightState).toBeCalledWith(ID);
  });
  test("unsubscribes from the light", async () => {
    const lightService = new LightService();
    lightService._messenger.unsubscribeFromLight = jest.fn();
    const ID = "Prysma-12345";

    await lightService.removeLight(ID);

    expect(lightService._messenger.unsubscribeFromLight).toBeCalledWith(ID);
  });
  test("does not notify listeners if it fails to remove the light", async () => {
    const lightService = new LightService();
    lightService._dao.removeLight = jest.fn(() => {
      throw new Error();
    });
    const ID = "Prysma-12345";

    const servicePromise = lightService.removeLight(ID);

    await expect(servicePromise).rejects.toThrow(Error);
    expect(mediatorEmitSpy).not.toBeCalled();
  });
});

describe("_handleMessengerConnect", () => {
  test("Subscribes to all the lights stored in the database", async () => {
    const lightService = new LightService();
    lightService._dao.getLights = jest.fn(() => MOCK_LIGHTS);
    lightService._messenger.subscribeToLight = jest.fn();

    await lightService._handleMessengerConnect();

    MOCK_LIGHTS.forEach(({ id }) => {
      expect(lightService._messenger.subscribeToLight).toBeCalledWith(id);
    });
  });
});

describe("_handleEffectListMessage", () => {
  test("Updates the effect list of the light in the database", async () => {
    const lightService = new LightService();
    lightService._dao.setLight = jest.fn();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";
    const EFFECTS = ["Test 1", "Test 2", "Test 3"];
    const MESSAGE = { name: ID, effectList: EFFECTS };

    await lightService._handleEffectListMessage(MESSAGE);

    expect(lightService._dao.setLight).toBeCalledWith(ID, {
      supportedEffects: EFFECTS
    });
  });
  test("Notifies listeners of the light's change", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";
    const EFFECTS = ["Test 1", "Test 2", "Test 3"];
    const MESSAGE = { name: ID, effectList: EFFECTS };

    await lightService._handleEffectListMessage(MESSAGE);

    expect(mediatorEmitSpy).toBeCalledWith(LIGHT_CHANGED_EVENT, MOCK_LIGHT);
  });
});

describe("_handleConfigMessage", () => {
  test("Updates the config info of the light in the database", async () => {
    const lightService = new LightService();
    lightService._dao.setLight = jest.fn();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";
    const CONFIG = { version: "1.0.0", stripType: "WS2812B" };
    const MESSAGE = { name: ID, ...CONFIG };

    await lightService._handleConfigMessage(MESSAGE);

    expect(lightService._dao.setLight).toBeCalledWith(ID, CONFIG);
  });
  test("Notifies listeners of the light's change", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(() => MOCK_LIGHT);
    const ID = "Prysma-12345";
    const CONFIG = { version: "1.0.0", stripType: "WS2812B" };
    const MESSAGE = { name: ID, ...CONFIG };

    await lightService._handleConfigMessage(MESSAGE);

    expect(mediatorEmitSpy).toBeCalledWith(LIGHT_CHANGED_EVENT, MOCK_LIGHT);
  });
});

describe.skip("_handleDiscoveryMessage", () => {
  test("does a thing", async () => {});
});

describe("getLightState", () => {
  test("Returns the light state from the cache", async () => {
    const lightService = new LightService();
    lightService._cache.getLightState = jest.fn(() => MOCK_LIGHT_STATE);
    const ID = "Prysma-12345";

    const light = await lightService.getLightState(ID);

    expect(lightService._cache.getLightState).toBeCalledWith(ID);
    expect(light).toBe(MOCK_LIGHT_STATE);
  });
  test("Rejects if it cant get the light state", async () => {
    const lightService = new LightService();
    const ERROR_MESSAGE = "Mock Error";
    lightService._cache.getLightState = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-12345";

    const servicePromise = lightService.getLightState(ID);

    await expect(servicePromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe("setLightState", () => {
  test("rejects if the light isnt in the cache", async () => {
    const lightService = new LightService();
    lightService._cache.getLightState = jest.fn(() => undefined);
    const ID = "Prysma-12345";
    const STATE = { effect: "Cylon" };

    const servicePromise = lightService.setLightState(ID, STATE);

    await expect(servicePromise).rejects.toThrow(`"${ID}" was never added`);
  });
  test("rejects if the light isnt connected", async () => {
    const lightService = new LightService();
    const disconnectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: false
    });
    lightService._cache.getLightState = jest.fn(() => disconnectedLightState);
    const ID = "Prysma-12345";
    const STATE = { effect: "Cylon" };

    const servicePromise = lightService.setLightState(ID, STATE);

    await expect(servicePromise).rejects.toThrow(`"${ID}" is not connected`);
  });
  test("maps on: true to state: ON", async () => {
    // Mock getSimpleUniqueId to return a given value instead of a random one
    const MUTATION_ID = 77;
    utils.getSimpleUniqueId.mockImplementationOnce(() => {
      return 77;
    });

    const lightService = new LightService();
    // Make sure the cache returns a connected light so no errors are thrown
    const connectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: true
    });
    lightService._cache.getLightState = jest.fn(() => connectedLightState);

    // Mock publishToLight to emit a response as soon as it is called to that the promise can resolve
    lightService._messenger.publishToLight = jest.fn(async () => {
      mediator.emit(MUTATION_RESPONSE_EVENT, {
        mutationId: MUTATION_ID,
        newState: connectedLightState
      });
    });
    const ID = "Prysma-12345";
    const STATE = { on: true };
    const expectedState = "ON";

    await lightService.setLightState(ID, STATE);

    expect(lightService._messenger.publishToLight).toBeCalledWith(
      ID,
      expect.objectContaining({ state: expectedState })
    );
  });
  test("maps on: false to state: OFF", async () => {
    // Mock getSimpleUniqueId to return a given value instead of a random one
    const MUTATION_ID = 77;
    utils.getSimpleUniqueId.mockImplementationOnce(() => {
      return 77;
    });

    const lightService = new LightService();
    // Make sure the cache returns a connected light so no errors are thrown
    const connectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: true
    });
    lightService._cache.getLightState = jest.fn(() => connectedLightState);

    // Mock publishToLight to emit a response as soon as it is called to that the promise can resolve
    lightService._messenger.publishToLight = jest.fn(async () => {
      mediator.emit(MUTATION_RESPONSE_EVENT, {
        mutationId: MUTATION_ID,
        newState: connectedLightState
      });
    });
    const ID = "Prysma-12345";
    const STATE = { on: false };
    const expectedState = "OFF";

    await lightService.setLightState(ID, STATE);

    expect(lightService._messenger.publishToLight).toBeCalledWith(
      ID,
      expect.objectContaining({ state: expectedState })
    );
  });
  test("appends on a mutationId", async () => {
    // Mock getSimpleUniqueId to return a given value instead of a random one
    const MUTATION_ID = 77;
    utils.getSimpleUniqueId.mockImplementationOnce(() => {
      return 77;
    });

    const lightService = new LightService();
    // Make sure the cache returns a connected light so no errors are thrown
    const connectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: true
    });
    lightService._cache.getLightState = jest.fn(() => connectedLightState);

    // Mock publishToLight to emit a response as soon as it is called to that the promise can resolve
    lightService._messenger.publishToLight = jest.fn(async () => {
      mediator.emit(MUTATION_RESPONSE_EVENT, {
        mutationId: MUTATION_ID,
        newState: connectedLightState
      });
    });
    const ID = "Prysma-12345";
    const STATE = { effect: "Juggle" };

    await lightService.setLightState(ID, STATE);

    expect(lightService._messenger.publishToLight).toBeCalledWith(
      ID,
      expect.objectContaining({ mutationId: MUTATION_ID })
    );
  });
  test("publishes the desired state to the light", async () => {
    // Mock getSimpleUniqueId to return a given value instead of a random one
    const MUTATION_ID = 77;
    utils.getSimpleUniqueId.mockImplementationOnce(() => {
      return 77;
    });

    const lightService = new LightService();
    // Make sure the cache returns a connected light so no errors are thrown
    const connectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: true
    });
    lightService._cache.getLightState = jest.fn(() => connectedLightState);

    // Mock publishToLight to emit a response as soon as it is called to that the promise can resolve
    lightService._messenger.publishToLight = jest.fn(async () => {
      mediator.emit(MUTATION_RESPONSE_EVENT, {
        mutationId: MUTATION_ID,
        newState: connectedLightState
      });
    });
    const ID = "Prysma-12345";
    const STATE = { brightness: 40, speed: 7, effect: "Juggle" };

    await lightService.setLightState(ID, STATE);

    expect(lightService._messenger.publishToLight).toBeCalledWith(
      ID,
      expect.objectContaining(STATE)
    );
  });
  test("removes the mutationResponse listener on success", async () => {
    // Mock getSimpleUniqueId to return a given value instead of a random one
    const MUTATION_ID = 77;
    utils.getSimpleUniqueId.mockImplementationOnce(() => {
      return 77;
    });

    const lightService = new LightService();
    // Make sure the cache returns a connected light so no errors are thrown
    const connectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: true
    });
    lightService._cache.getLightState = jest.fn(() => connectedLightState);

    // Mock publishToLight to emit a response as soon as it is called to that the promise can resolve
    lightService._messenger.publishToLight = jest.fn(async () => {
      mediator.emit(MUTATION_RESPONSE_EVENT, {
        mutationId: MUTATION_ID,
        newState: connectedLightState
      });
    });
    const ID = "Prysma-12345";
    const STATE = { brightness: 40, speed: 7, effect: "Juggle" };

    await lightService.setLightState(ID, STATE);

    expect(mediatorRemoveListenerSpy).toBeCalledWith(
      MUTATION_RESPONSE_EVENT,
      expect.any(Function)
    );
  });
  test("returns the changed light", async () => {
    // Mock getSimpleUniqueId to return a given value instead of a random one
    const MUTATION_ID = 77;
    utils.getSimpleUniqueId.mockImplementationOnce(() => {
      return 77;
    });

    const lightService = new LightService();
    // Make sure the cache returns a connected light so no errors are thrown
    const connectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: true
    });
    lightService._cache.getLightState = jest.fn(() => connectedLightState);

    // Mock publishToLight to emit a response as soon as it is called to that the promise can resolve
    lightService._messenger.publishToLight = jest.fn(async () => {
      mediator.emit(MUTATION_RESPONSE_EVENT, {
        mutationId: MUTATION_ID,
        newState: connectedLightState
      });
    });
    const ID = "Prysma-12345";
    const STATE = { brightness: 40, speed: 7, effect: "Juggle" };

    const changedLightState = await lightService.setLightState(ID, STATE);

    expect(changedLightState).toBe(connectedLightState);
  });
  test("times out after a set amount of time with no response", async () => {
    // Use fake timers for this test
    jest.useFakeTimers();
    const lightService = new LightService();
    // Make sure the cache returns a connected light so no errors are thrown
    const connectedLightState = Object.assign({}, MOCK_LIGHT_STATE, {
      connected: true
    });
    lightService._cache.getLightState = jest.fn(() => connectedLightState);
    // Dont emit a response as soon as it is called to that the promise wont resolve
    lightService._messenger.publishToLight = jest.fn(async () => {});
    const ID = "Prysma-12345";
    const STATE = { brightness: 40, speed: 7, effect: "Juggle" };

    const servicePromise = lightService.setLightState(ID, STATE);
    await Promise.resolve(); // allow any pending jobs in the PromiseJobs queue to run
    jest.runAllTimers(); // Run all timers so we dont have to wait

    await expect(servicePromise).rejects.toThrow(
      `Response from ${ID} timed out`
    );
    expect(setTimeout).toBeCalledWith(expect.any(Function), TIMEOUT_WAIT);
  });
});

describe("_handleConnectedMessage", () => {
  test("updates the lightState in the cache with the new connected value", async () => {
    const lightService = new LightService();
    lightService._cache.setLightState = jest.fn();
    const ID = "Prysma-12345";
    const CONNECTION = 2;
    const MESSAGE = { name: ID, connection: CONNECTION };

    await lightService._handleConnectedMessage(MESSAGE);

    expect(lightService._cache.setLightState).toBeCalledWith(
      ID,
      expect.objectContaining({ connected: expect.anything() })
    );
  });
  test("maps connection: 2 to connected: true", async () => {
    const lightService = new LightService();
    lightService._cache.setLightState = jest.fn();
    const ID = "Prysma-12345";
    const CONNECTION = 2;
    const expectedConnected = true;
    const MESSAGE = { name: ID, connection: CONNECTION };

    await lightService._handleConnectedMessage(MESSAGE);

    expect(lightService._cache.setLightState).toBeCalledWith(ID, {
      connected: expectedConnected
    });
  });
  test("maps connection: 0 to connected: false", async () => {
    const lightService = new LightService();
    lightService._cache.setLightState = jest.fn();
    const ID = "Prysma-12345";
    const CONNECTION = 0;
    const expectedConnected = false;
    const MESSAGE = { name: ID, connection: CONNECTION };

    await lightService._handleConnectedMessage(MESSAGE);

    expect(lightService._cache.setLightState).toBeCalledWith(ID, {
      connected: expectedConnected
    });
  });
  test("notifies listeners of the new light state", async () => {
    const lightService = new LightService();
    lightService._cache.getLightState = jest.fn(() => MOCK_LIGHT_STATE);
    const ID = "Prysma-12345";
    const CONNECTION = 0;
    const MESSAGE = { name: ID, connection: CONNECTION };

    await lightService._handleConnectedMessage(MESSAGE);

    expect(mediatorEmitSpy).toBeCalledWith(
      LIGHT_STATE_CHANGED_EVENT,
      MOCK_LIGHT_STATE
    );
  });
});

describe("_handleStateMessage", () => {
  test("updates the light state in the cache with the new state values", async () => {
    const lightService = new LightService();
    lightService._cache.setLightState = jest.fn();
    const ID = "Prysma-12345";
    const STATE = "OFF";
    const MUTATION_ID = 1024;
    const MESSAGE = {
      name: ID,
      mutationId: MUTATION_ID,
      state: STATE,
      color: { r: 255, g: 100, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };

    await lightService._handleStateMessage(MESSAGE);

    expect(lightService._cache.setLightState).toBeCalledWith(ID, {
      on: expect.anything(),
      color: MESSAGE.color,
      brightness: MESSAGE.brightness,
      effect: MESSAGE.effect,
      speed: MESSAGE.speed
    });
  });
  test("maps state: ON to on: true", async () => {
    const lightService = new LightService();
    lightService._cache.setLightState = jest.fn();
    const ID = "Prysma-12345";
    const STATE = "ON";
    const expectedOn = true;
    const MUTATION_ID = 1024;
    const MESSAGE = {
      name: ID,
      mutationId: MUTATION_ID,
      state: STATE,
      color: { r: 255, g: 100, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };

    await lightService._handleStateMessage(MESSAGE);

    expect(lightService._cache.setLightState).toBeCalledWith(
      ID,
      expect.objectContaining({
        on: expectedOn
      })
    );
  });
  test("maps state: OFF to on: false", async () => {
    const lightService = new LightService();
    lightService._cache.setLightState = jest.fn();
    const ID = "Prysma-12345";
    const STATE = "OFF";
    const expectedOn = false;
    const MUTATION_ID = 1024;
    const MESSAGE = {
      name: ID,
      mutationId: MUTATION_ID,
      state: STATE,
      color: { r: 255, g: 100, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };

    await lightService._handleStateMessage(MESSAGE);

    expect(lightService._cache.setLightState).toBeCalledWith(
      ID,
      expect.objectContaining({
        on: expectedOn
      })
    );
  });
  test("notifies listeners of the new state", async () => {
    const lightService = new LightService();
    lightService._cache.getLightState = jest.fn(() => MOCK_LIGHT_STATE);
    const ID = "Prysma-12345";
    const STATE = "OFF";
    const MUTATION_ID = 1024;
    const MESSAGE = {
      name: ID,
      mutationId: MUTATION_ID,
      state: STATE,
      color: { r: 255, g: 100, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };

    await lightService._handleStateMessage(MESSAGE);

    expect(mediatorEmitSpy).toBeCalledWith(
      LIGHT_STATE_CHANGED_EVENT,
      MOCK_LIGHT_STATE
    );
  });
  test("notifies the mutation response listener", async () => {
    const lightService = new LightService();
    lightService._cache.getLightState = jest.fn(() => MOCK_LIGHT_STATE);
    const ID = "Prysma-12345";
    const STATE = "OFF";
    const MUTATION_ID = 1024;
    const MESSAGE = {
      name: ID,
      mutationId: MUTATION_ID,
      state: STATE,
      color: { r: 255, g: 100, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };

    await lightService._handleStateMessage(MESSAGE);

    expect(mediatorEmitSpy).toBeCalledWith(MUTATION_RESPONSE_EVENT, {
      mutationId: MUTATION_ID,
      newState: MOCK_LIGHT_STATE
    });
  });
});
