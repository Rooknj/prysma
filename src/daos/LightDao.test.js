const PrysmaDB = require("./LightDao");
const { toLightModel } = require("../utils/lightUtils");

jest.mock("../clients/db", () => {
  const DbConnectionMock = require("sequelize-mock");
  const dbConnectionMock = new DbConnectionMock();

  const LightModelMock = dbConnectionMock.define("light", {
    id: "Prysma-AABBCCDDEEFF",
    name: "Mock Light",
    supportedEffects: "test 1,test 2, test 3", // TEXT is unlimited length string
    ipAddress: "10.0.0.1",
    macAddress: "AA:BB:CC:DD:EE:FF",
    numLeds: 60,
    udpPort: 7778,
    version: "0.0.0",
    hardware: "8266",
    colorOrder: "GRB",
    stripType: "WS2812B",
    rank: 1
  });
  LightModelMock.findByPk = jest.fn(LightModelMock.findById);
  LightModelMock.update = jest.fn(LightModelMock.update);
  LightModelMock.destroy = jest.fn(LightModelMock.destroy);

  const getDb = jest.fn(() => {
    return Object.create(LightModelMock);
  });

  return { getDb };
});

let mockLightModel;
const NO_ID_ERROR = "No ID provided";
const NO_DATA_ERROR = "No Data provided";

beforeEach(() => {
  mockLightModel = {
    id: "Mock1",
    name: "Mock Light",
    supportedEffects: ["test 1", "test 2", "test 3", "test 4"],
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

describe("constructor", () => {
  test("initializes correctly", () => {
    const prysmaDb = new PrysmaDB();

    expect(prysmaDb._db).not.toBeNull();
  });
});

describe("getLight", () => {
  test("Returns the light with the specified id (1)", async () => {
    const prysmaDb = new PrysmaDB();

    const ID = "Mock 1";
    const testLight = await prysmaDb.getLight(ID);

    expect(testLight.id).toBe(ID);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Returns the light with the specified id (2)", async () => {
    const prysmaDb = new PrysmaDB();

    const ID = "Prysma-AABBCCDD1144";
    const testLight = await prysmaDb.getLight(ID);

    expect(testLight.id).toBe(ID);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Rejects if no id is given", async () => {
    const prysmaDb = new PrysmaDB();

    try {
      await prysmaDb.getLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
  test("Rejects if the light wasnt found", async () => {
    const prysmaDb = new PrysmaDB();

    prysmaDb._db.findByPk = jest.fn();
    const ID = "Prysma-112233445566";

    try {
      await prysmaDb.getLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`"${ID}" not found`);
    }
  });
  test("Rejects if it cant get the light", async () => {
    const prysmaDb = new PrysmaDB();

    const ERROR_MESSAGE = "Mock Error";
    prysmaDb._db.findByPk = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-112233445566";

    try {
      await prysmaDb.getLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("getLights", () => {
  test("Returns all the lights", async () => {
    const prysmaDb = new PrysmaDB();

    const testLights = await prysmaDb.getLights();

    expect(Array.isArray(testLights));
    expect(Object.keys(testLights[0])).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Rejects if it cant get the lights", async () => {
    const prysmaDb = new PrysmaDB();

    const ERROR_MESSAGE = "Mock Error";
    prysmaDb._db.findAll = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });

    try {
      await prysmaDb.getLights();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("setLight", () => {
  test("Correctly sets the light", async () => {
    const prysmaDb = new PrysmaDB();

    const ID = "Mock 1";
    const DATA = {
      name: "New name",
      supportedEffects: ["test 1", "test 2", "test 3", "test 4"],
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
    prysmaDb._db.findByPk = jest.fn(() => mockLightModel);
    await prysmaDb.setLight(ID, DATA);

    expect(prysmaDb._db.findByPk).toBeCalledTimes(1);
    expect(prysmaDb._db.findByPk).toBeCalledWith(ID);
    expect(mockLightModel.update).toBeCalledTimes(1);
    expect(mockLightModel.update).toBeCalledWith(
      expect.objectContaining(toLightModel(DATA))
    );
  });
  test("Rejects if no id is given", async () => {
    const prysmaDb = new PrysmaDB();

    try {
      await prysmaDb.setLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
  test("Rejects if no data is given", async () => {
    const prysmaDb = new PrysmaDB();

    try {
      await prysmaDb.setLight("Mock ID");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_DATA_ERROR);
    }
  });
  test("Rejects if the light doesnt exist", async () => {
    const prysmaDb = new PrysmaDB();

    prysmaDb._db.findByPk = jest.fn();
    const ID = "Prysma-Mock";
    const DATA = {
      name: "New name",
      supportedEffects: ["test 1", "test 2", "test 3", "test 4"],
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
      await prysmaDb.setLight(ID, DATA);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`"${ID}" not found`);
    }
  });
  test("Rejects if it cant set the light", async () => {
    const prysmaDb = new PrysmaDB();

    const ID = "Mock 1";
    const DATA = {
      name: "New name",
      supportedEffects: ["test 1", "test 2", "test 3", "test 4"],
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
    prysmaDb._db.findByPk = jest.fn(() => mockLightModel);

    try {
      await prysmaDb.setLight(ID, DATA);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("addLight", () => {
  test("Adds the light", async () => {
    const prysmaDb = new PrysmaDB();

    const ID = "Prysma-334455667788";
    const NAME = "Window";
    const testLight = await prysmaDb.addLight(ID, NAME);

    expect(testLight.id).toBe(ID);
    expect(testLight.name).toBe(NAME);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Adds the light with name = ID if no name was given", async () => {
    const prysmaDb = new PrysmaDB();

    const ID = "Prysma-334455667788";
    const testLight = await prysmaDb.addLight(ID);

    expect(testLight.id).toBe(ID);
    expect(testLight.name).toBe(ID);
    expect(Object.keys(testLight)).toEqual(
      expect.arrayContaining(Object.keys(mockLightModel))
    );
  });
  test("Rejects if no id is given", async () => {
    const prysmaDb = new PrysmaDB();

    try {
      await prysmaDb.addLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
  test("Rejects if it cant add the light", async () => {
    const prysmaDb = new PrysmaDB();

    const ERROR_MESSAGE = "Mock Error Add";
    prysmaDb._db.create = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-112233445566";

    try {
      await prysmaDb.addLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGE);
    }
  });
});

describe("removeLight", () => {
  test("Removes the light", async () => {
    const prysmaDb = new PrysmaDB();

    const ID = "Prysma-334455667788";
    const NAME = "Mock Light";
    const testLight = await prysmaDb.removeLight(ID);

    expect(testLight).toEqual({ id: ID, name: NAME });
  });
  test("Rejects if the light doesnt exist", async () => {
    const prysmaDb = new PrysmaDB();

    prysmaDb._db.findByPk = jest.fn();
    const ID = "Prysma-334455667788";

    try {
      await prysmaDb.removeLight(ID);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(`"${ID}" not found`);
    }
  });
  test("Rejects if no id is given", async () => {
    const prysmaDb = new PrysmaDB();

    try {
      await prysmaDb.removeLight();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(NO_ID_ERROR);
    }
  });
});
