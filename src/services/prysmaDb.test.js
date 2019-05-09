const PrysmaDB = require("./prysmaDb");
const Sequelize = require("sequelize");

jest.mock("sequelize");
jest.mock("../models/light.js");

let mockLightModel;
const NO_ID_ERROR = "No ID provided";

beforeEach(() => {
  mockLightModel = {
    id: "Mock1",
    name: "Mock Light",
    supportedEffects: "test 1,test 2, test 3",
    ipAddress: "10.0.0.1",
    macAddress: "AA:BB:CC:DD:EE:FF",
    numLeds: 60,
    udpPort: 7778,
    version: "0.0.0",
    hardware: "8266",
    colorOrder: "GRB",
    stripType: "WS2812B",
    rank: 1
  };
});

// Mock light model with customized sequelize-mock module (add findByPk as findById) (make sure it is a function that returns the mock model instance)
// Mock sequelize with a model that calls authenticate and sync
describe("constructor", () => {
  test("initializes correctly", () => {
    const prysmaDB = new PrysmaDB();

    expect(prysmaDB._sequelize).toBeNull();
    expect(prysmaDB._models).toEqual({});
  });
});

describe("connect", () => {
  test("Connects and syncs models to the database", async () => {
    const prysmaDB = new PrysmaDB();

    await prysmaDB.connect();

    expect(prysmaDB._sequelize).toBeDefined();
    expect(prysmaDB._sequelize.authenticate).toBeCalledTimes(1);
    expect(prysmaDB._sequelize.sync).toBeCalledTimes(1);
    expect(prysmaDB._models.Light).toBeDefined();
  });
  test("Throws an error if the connection fails (1)", async () => {
    const ERROR_MESSAGE = "test error 1";
    Sequelize.mockImplementationOnce(() => {
      return {
        authenticate: async () => {
          throw new Error(ERROR_MESSAGE);
        }
      };
    });

    const prysmaDB = new PrysmaDB();

    try {
      await prysmaDB.connect();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
  test("Throws an error if the connection fails (2)", async () => {
    const ERROR_MESSAGE = "test error 2";
    Sequelize.mockImplementationOnce(() => {
      return {
        authenticate: jest.fn(),
        sync: async () => {
          throw new Error(ERROR_MESSAGE);
        }
      };
    });

    const prysmaDB = new PrysmaDB();

    try {
      await prysmaDB.connect();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("getLight", () => {
  test("Returns the light with the specified id (1)", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ID = "Mock 1";
    const testLight = await prysmaDB.getLight(ID);

    expect(testLight.id).toBe(ID);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Returns the light with the specified id (2)", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ID = "Prysma-AABBCCDD1144";
    const testLight = await prysmaDB.getLight(ID);

    expect(testLight.id).toBe(ID);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Throws an error if no id is given", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    try {
      await prysmaDB.getLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
  test("Throws an error if the light wasnt found", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    prysmaDB._models.Light.findByPk = jest.fn();
    const ID = "Prysma-112233445566";

    try {
      await prysmaDB.getLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`"${ID}" not found`);
    }
  });
  test("Throws an error if it cant get the light", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ERROR_MESSAGE = "Mock Error";
    prysmaDB._models.Light.findByPk = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-112233445566";

    try {
      await prysmaDB.getLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("getLights", () => {
  test("Returns all the lights", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const testLights = await prysmaDB.getLights();

    expect(Array.isArray(testLights));
    expect(Object.keys(testLights[0])).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Throws an error if it cant get the lights", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ERROR_MESSAGE = "Mock Error";
    prysmaDB._models.Light.findAll = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });

    try {
      await prysmaDB.getLights();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("setLight", () => {
  test("Correctly sets the light", async () => {});
  test("Throws an error if no id is given", async () => {});
  test("Throws an error if no data is given", async () => {});
  test("Throws an error if it cant set the light", async () => {});
  test("Throws an error if id is improperly formatted", async () => {});
  test("Throws an error if name is improperly formatted", async () => {});
  test("Throws an error if supportedEffects is improperly formatted", async () => {});
  test("Throws an error if idAddress is improperly formatted", async () => {});
  test("Throws an error if macAddress is improperly formatted", async () => {});
  test("Throws an error if numLeds is improperly formatted", async () => {});
  test("Throws an error if udpPort is improperly formatted", async () => {});
  test("Throws an error if version is improperly formatted", async () => {});
  test("Throws an error if hardware is improperly formatted", async () => {});
  test("Throws an error if colorOrder is improperly formatted", async () => {});
  test("Throws an error if stripType is improperly formatted", async () => {});
  test("Throws an error if rank is improperly formatted", async () => {});
});

describe("addLight", () => {
  test("Adds the light", async () => {});
  test("Throws an error if no id is given", async () => {});
  test("Throws an error if the light was already created", async () => {});
});

describe("removeLight", () => {
  test("Removes the light", async () => {});
  test("Throws an error if the light was not already added", async () => {});
  test("Throws an error if no id is given", async () => {});
});
