const PrysmaDB = require("./LightDao");
const Sequelize = require("sequelize");

jest.mock("sequelize");
jest.mock("../models/LightModel.js");

let mockLightModel;
const NO_ID_ERROR = "No ID provided";
const NO_DATA_ERROR = "No Data provided";

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
  test("Rejects if the connection fails (1)", async () => {
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
  test("Rejects if the connection fails (2)", async () => {
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
  test("Rejects if no id is given", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    try {
      await prysmaDB.getLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
  test("Rejects if the light wasnt found", async () => {
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
  test("Rejects if it cant get the light", async () => {
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
  test("Rejects if it cant get the lights", async () => {
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
  test("Correctly sets the light", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ID = "Mock 1";
    const DATA = {
      name: "New name",
      supportedEffects: "test 1,test 2, test 3, test 4",
      ipAddress: "1.0.0.0",
      macAddress: "AA:BB:CC:DD:EE:GG",
      numLeds: 61,
      udpPort: 7777,
      version: "0.0.1",
      hardware: "D1MINI",
      colorOrder: "RGB",
      stripType: "WS2811",
      rank: 2
    };
    mockLightModel.update = jest.fn();
    prysmaDB._models.Light.findByPk = jest.fn(() => mockLightModel);
    await prysmaDB.setLight(ID, DATA);

    expect(prysmaDB._models.Light.findByPk).toBeCalledTimes(1);
    expect(prysmaDB._models.Light.findByPk).toBeCalledWith(ID);
    expect(mockLightModel.update).toBeCalledTimes(1);
    expect(mockLightModel.update).toBeCalledWith(expect.objectContaining(DATA));
  });
  test("Rejects if no id is given", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    try {
      await prysmaDB.setLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
  test("Rejects if no data is given", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    try {
      await prysmaDB.setLight("Mock ID");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_DATA_ERROR);
    }
  });
  test("Rejects if the light doesnt exist", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    prysmaDB._models.Light.findByPk = jest.fn();
    const ID = "Prysma-Mock";
    const DATA = {
      name: "New name",
      supportedEffects: "test 1,test 2, test 3, test 4",
      ipAddress: "1.0.0.0",
      macAddress: "AA:BB:CC:DD:EE:GG",
      numLeds: 61,
      udpPort: 7777,
      version: "0.0.1",
      hardware: "D1MINI",
      colorOrder: "RGB",
      stripType: "WS2811",
      rank: 2
    };

    try {
      await prysmaDB.setLight(ID, DATA);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`"${ID}" not found`);
    }
  });
  test("Rejects if it cant set the light", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ID = "Mock 1";
    const DATA = {
      name: "New name",
      supportedEffects: "test 1,test 2, test 3, test 4",
      ipAddress: "1.0.0.0",
      macAddress: "AA:BB:CC:DD:EE:GG",
      numLeds: 61,
      udpPort: 7777,
      version: "0.0.1",
      hardware: "D1MINI",
      colorOrder: "RGB",
      stripType: "WS2811",
      rank: 2
    };
    const ERROR_MESSAGE = "Mock Error Update";
    mockLightModel.update = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    prysmaDB._models.Light.findByPk = jest.fn(() => mockLightModel);

    try {
      await prysmaDB.setLight(ID, DATA);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("addLight", () => {
  test("Adds the light", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ID = "Prysma-334455667788";
    const NAME = "Window";
    const testLight = await prysmaDB.addLight(ID, NAME);

    expect(testLight.id).toBe(ID);
    expect(testLight.name).toBe(NAME);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Adds the light with name = ID if no name was given", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ID = "Prysma-334455667788";
    const testLight = await prysmaDB.addLight(ID);

    expect(testLight.id).toBe(ID);
    expect(testLight.name).toBe(ID);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Rejects if no id is given", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    try {
      await prysmaDB.addLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
  test("Rejects if it cant add the light", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ERROR_MESSAGE = "Mock Error Add";
    prysmaDB._models.Light.create = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-112233445566";

    try {
      await prysmaDB.addLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("removeLight", () => {
  test("Removes the light", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    const ID = "Prysma-334455667788";
    const NAME = "Mock Light";
    const testLight = await prysmaDB.removeLight(ID);

    expect(testLight).toEqual({ id: ID, name: NAME });
  });
  test("Rejects if the light doesnt exist", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    prysmaDB._models.Light.findByPk = jest.fn();
    const ID = "Prysma-334455667788";

    try {
      await prysmaDB.removeLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`"${ID}" not found`);
    }
  });
  test("Rejects if no id is given", async () => {
    const prysmaDB = new PrysmaDB();
    await prysmaDB.connect();

    try {
      await prysmaDB.removeLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
});
