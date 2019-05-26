const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");
const mediator = require("./mediator");
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
jest.mock("./mediator");

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

beforeAll(() => {
  // Override getLights automock value
  LightDao.prototype.getLights = jest.fn(() => MOCK_LIGHTS);
});

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  LightMessenger.mockClear();
  LightDao.mockClear();
  LightCache.mockClear();
  mediator.emit.mockClear();
  mediator.on.mockClear();
  mediator.once.mockClear();
  mediator.addListener.mockClear();
  mediator.removeListener.mockClear();
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
      expect.anything()
    );
  });
  test("Sets a messenger connectedMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "connectedMessage",
      expect.anything()
    );
  });
  test("Sets a messenger stateMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "stateMessage",
      expect.anything()
    );
  });
  test("Sets a messenger effectListMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "effectListMessage",
      expect.anything()
    );
  });
  test("Sets a messenger discoveryMessage listener", async () => {
    const lightService = new LightService();
    lightService._messenger.on = jest.fn();

    await lightService.init();

    expect(lightService._messenger.on).toBeCalledWith(
      "discoveryMessage",
      expect.anything()
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

    expect(mediator.emit).toBeCalledWith(LIGHT_CHANGED_EVENT, MOCK_LIGHT);
  });
  test("does not notify listeners about the new light if it cant set the light", async () => {
    const lightService = new LightService();
    lightService._dao.setLight = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    const servicePromise = lightService.setLight(ID, DATA);

    await expect(servicePromise).rejects;
    expect(mediator.emit).not.toBeCalled();
  });
  test("does not notify listeners about the new light if it cant retrieve the set light", async () => {
    const lightService = new LightService();
    lightService._dao.getLight = jest.fn(async () => {
      throw new Error();
    });
    const ID = "Prysma-12345";
    const DATA = { name: "Hello2" };

    const servicePromise = lightService.setLight(ID, DATA);

    await expect(servicePromise).rejects;
    expect(mediator.emit).not.toBeCalled();
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
  test("does a thing", async () => {});
});

describe("removeLight", () => {
  test("does a thing", async () => {});
});

describe("_handleMessengerConnect", () => {
  test("does a thing", async () => {});
});

describe("_handleEffectListMessage", () => {
  test("does a thing", async () => {});
});

describe("_handleConfigMessage", () => {
  test("does a thing", async () => {});
});

describe("_handleDiscoveryMessage", () => {
  test("does a thing", async () => {});
});

describe("getLightState", () => {
  test("does a thing", async () => {});
});

describe("setLightState", () => {
  test("does a thing", async () => {});
});

describe("_handleConnectedMessage", () => {
  test("does a thing", async () => {});
});

describe("_handleStateMessage", () => {
  test("does a thing", async () => {});
});
