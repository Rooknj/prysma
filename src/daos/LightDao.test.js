const LightDao = require("./LightDao");
const { toLightModel } = require("../utils/lightUtils");

jest.mock("../clients/db", () => {
  // eslint-disable-next-line global-require
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
    rank: 1,
  });
  LightModelMock.findByPk = jest.fn(LightModelMock.findById);
  LightModelMock.update = jest.fn(LightModelMock.update);
  LightModelMock.destroy = jest.fn(LightModelMock.destroy);

  const getDb = jest.fn(() => Object.create(LightModelMock));

  return { getDb };
});

let lightDao;
let mockLightModel;
const NO_ID_ERROR = "No ID provided";
const NO_DATA_ERROR = "No Data provided";

beforeEach(() => {
  lightDao = new LightDao();
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
    rank: 1,
  };
});

describe("constructor", () => {
  test("initializes correctly", () => {
    expect(lightDao._db).not.toBeNull();
  });
});

describe("getLight", () => {
  test("Returns the light with the specified id (1)", async () => {
    const ID = "Mock 1";
    const testLight = await lightDao.getLight(ID);

    expect(testLight.id).toBe(ID);
    expect(Object.keys(testLight)).toEqual(expect.arrayContaining(Object.keys(mockLightModel)));
  });
  test("Returns the light with the specified id (2)", async () => {
    const ID = "Prysma-AABBCCDD1144";
    const testLight = await lightDao.getLight(ID);

    expect(testLight.id).toBe(ID);
    expect(Object.keys(testLight)).toEqual(expect.arrayContaining(Object.keys(mockLightModel)));
  });
  test("Rejects if no id is given", async () => {
    const dbPromise = lightDao.getLight();

    await expect(dbPromise).rejects.toThrow(NO_ID_ERROR);
  });
  test("Rejects if the light wasnt found", async () => {
    lightDao._db.findByPk = jest.fn();
    const ID = "Prysma-112233445566";

    const dbPromise = lightDao.getLight(ID);

    await expect(dbPromise).rejects.toThrow(`"${ID}" not found`);
  });
  test("Rejects if it cant get the light", async () => {
    const ERROR_MESSAGE = "Mock Error";
    lightDao._db.findByPk = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-112233445566";

    const dbPromise = lightDao.getLight(ID);

    await expect(dbPromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe("getLights", () => {
  test("Returns all the lights", async () => {
    const testLights = await lightDao.getLights();

    expect(Array.isArray(testLights)).toBe(true);
    expect(Object.keys(testLights[0])).toEqual(expect.arrayContaining(Object.keys(mockLightModel)));
  });
  test("Rejects if it cant get the lights", async () => {
    const ERROR_MESSAGE = "Mock Error";
    lightDao._db.findAll = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });

    const dbPromise = lightDao.getLights();

    await expect(dbPromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe("setLight", () => {
  test("Correctly sets the light", async () => {
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
      rank: 2,
    };
    mockLightModel.update = jest.fn();
    lightDao._db.findByPk = jest.fn(() => mockLightModel);
    await lightDao.setLight(ID, DATA);

    expect(lightDao._db.findByPk).toHaveBeenCalledTimes(1);
    expect(lightDao._db.findByPk).toHaveBeenCalledWith(ID);
    expect(mockLightModel.update).toHaveBeenCalledTimes(1);
    expect(mockLightModel.update).toHaveBeenCalledWith(expect.objectContaining(toLightModel(DATA)));
  });
  test("Rejects if no id is given", async () => {
    const dbPromise = lightDao.setLight();

    await expect(dbPromise).rejects.toThrow(NO_ID_ERROR);
  });
  test("Rejects if no data is given", async () => {
    const dbPromise = lightDao.setLight("Mock ID");

    await expect(dbPromise).rejects.toThrow(NO_DATA_ERROR);
  });
  test("Rejects if the light doesnt exist", async () => {
    lightDao._db.findByPk = jest.fn();
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
      rank: 2,
    };

    const dbPromise = lightDao.setLight(ID, DATA);

    await expect(dbPromise).rejects.toThrow(`"${ID}" not found`);
  });
  test("Rejects if it cant set the light", async () => {
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
      rank: 2,
    };
    const ERROR_MESSAGE = "Mock Error Update";
    mockLightModel.update = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    lightDao._db.findByPk = jest.fn(() => mockLightModel);

    const dbPromise = lightDao.setLight(ID, DATA);

    await expect(dbPromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe("addLight", () => {
  test("Adds the light", async () => {
    const ID = "Prysma-334455667788";
    const NAME = "Window";
    const testLight = await lightDao.addLight(ID, NAME);

    expect(testLight.id).toBe(ID);
    expect(testLight.name).toBe(NAME);
    expect(Object.keys(testLight)).toEqual(expect.arrayContaining(Object.keys(mockLightModel)));
  });
  test("Adds the light with name = ID if no name was given", async () => {
    const ID = "Prysma-334455667788";
    const testLight = await lightDao.addLight(ID);

    expect(testLight.id).toBe(ID);
    expect(testLight.name).toBe(ID);
    expect(Object.keys(testLight)).toEqual(expect.arrayContaining(Object.keys(mockLightModel)));
  });
  test("Rejects if no id is given", async () => {
    const dbPromise = lightDao.addLight();

    await expect(dbPromise).rejects.toThrow(NO_ID_ERROR);
  });
  test("Rejects if it cant add the light", async () => {
    const ERROR_MESSAGE = "Mock Error Add";
    lightDao._db.create = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
    });
    const ID = "Prysma-112233445566";

    const dbPromise = lightDao.addLight(ID);

    await expect(dbPromise).rejects.toThrow(ERROR_MESSAGE);
  });
});

describe("removeLight", () => {
  test("Removes the light", async () => {
    const ID = "Prysma-334455667788";
    const NAME = "Mock Light";
    const testLight = await lightDao.removeLight(ID);

    expect(testLight).toEqual({ id: ID, name: NAME });
  });
  test("Rejects if the light doesnt exist", async () => {
    lightDao._db.findByPk = jest.fn();
    const ID = "Prysma-334455667788";

    const dbPromise = lightDao.removeLight(ID);

    await expect(dbPromise).rejects.toThrow(`"${ID}" not found`);
  });
  test("Rejects if no id is given", async () => {
    const dbPromise = lightDao.removeLight();

    await expect(dbPromise).rejects.toThrow(NO_ID_ERROR);
  });
});
