const PrysmaDB = require("./prysmaDb");

describe("constructor", () => {
  test("initializes correctly", () => {});
});

describe("connect", () => {
  test("Connects to the database with the given options", () => {});
  test("Throws an error if the connection fails", () => {});
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
