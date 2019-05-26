const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");
const mediator = require("./mediator");

const serviceConstants = require("./serviceConstants");
const {
  TIMEOUT_WAIT,
  MUTATION_RESPONSE_EVENT,
  LIGHT_ADDED_EVENT,
  LIGHT_REMOVED_EVENT,
  LIGHT_CHANGED_EVENT,
  LIGHT_STATE_CHANGED_EVENT
} = serviceConstants;

jest.mock("../messengers/LightMessenger");
jest.mock("../daos/LightDao");
jest.mock("../caches/LightCache");
jest.mock("./mediator");

describe("constructor", () => {
  test("does a thing", () => {});
});

describe("_init", () => {
  test("does a thing", () => {});
});

describe("getLight", () => {
  test("does a thing", () => {});
});

describe("getLights", () => {
  test("does a thing", () => {});
});

describe("getDiscoveredLights", () => {
  test("does a thing", () => {});
});

describe("setLight", () => {
  test("does a thing", () => {});
});

describe("addLight", () => {
  test("does a thing", () => {});
});

describe("removeLight", () => {
  test("does a thing", () => {});
});

describe("_handleMessengerConnect", () => {
  test("does a thing", () => {});
});

describe("_handleEffectListMessage", () => {
  test("does a thing", () => {});
});

describe("_handleConfigMessage", () => {
  test("does a thing", () => {});
});

describe("_handleDiscoveryMessage", () => {
  test("does a thing", () => {});
});

describe("getLightState", () => {
  test("does a thing", () => {});
});

describe("setLightState", () => {
  test("does a thing", () => {});
});

describe("_handleConnectedMessage", () => {
  test("does a thing", () => {});
});

describe("_handleStateMessage", () => {
  test("does a thing", () => {});
});
