const PrysmaDB = require("./prysmaDb");
const Sequelize = require("sequelize");

jest.mock("sequelize");
jest.mock("../models/light.js");

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
  test("Returns the light with the specified id", () => {});
  test("Throws an error if no id is given", () => {});
  test("Throws an error if the light wasnt found", () => {});
  test("Throws an error if it cant get the light", () => {});
});

describe("getLights", () => {
  test("Returns all the lights", () => {});
  test("Throws an error if it cant get the lights", () => {});
});

describe("setLight", () => {
  test("Correctly sets the light", () => {});
  test("Throws an error if no id is given", () => {});
  test("Throws an error if no data is given", () => {});
  test("Throws an error if it cant set the light", () => {});
  test("Throws an error if id is improperly formatted", () => {});
  test("Throws an error if name is improperly formatted", () => {});
  test("Throws an error if supportedEffects is improperly formatted", () => {});
  test("Throws an error if idAddress is improperly formatted", () => {});
  test("Throws an error if macAddress is improperly formatted", () => {});
  test("Throws an error if numLeds is improperly formatted", () => {});
  test("Throws an error if udpPort is improperly formatted", () => {});
  test("Throws an error if version is improperly formatted", () => {});
  test("Throws an error if hardware is improperly formatted", () => {});
  test("Throws an error if colorOrder is improperly formatted", () => {});
  test("Throws an error if stripType is improperly formatted", () => {});
  test("Throws an error if rank is improperly formatted", () => {});
});

describe("addLight", () => {
  test("Adds the light", () => {});
  test("Throws an error if no id is given", () => {});
  test("Throws an error if the light was already created", () => {});
});

describe("removeLight", () => {
  test("Removes the light", () => {});
  test("Throws an error if the light was not already added", () => {});
  test("Throws an error if no id is given", () => {});
});
