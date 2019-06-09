const { validateLightState, validateDiscoveredLight } = require("./cacheValidators");

describe("validateLightState", () => {
  let correctMessage;
  beforeEach(() => {
    correctMessage = {
      connected: true,
      on: false,
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4,
    };
  });
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = correctMessage;
    const result = validateLightState(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateLightState();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect connected", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, { connected: 2 });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect on", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      on: "ON",
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      color: { r: 256, g: -3, b: "Hello" },
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect brightness", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      brightness: 101,
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      effect: 4,
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect speed", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      speed: "abc",
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

// TODO: Implement tests here
describe("validateDiscoveredLight", () => {
  let correctMessage;
  beforeEach(() => {
    correctMessage = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
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

  test("validates a correct message", () => {
    const CORRECT_MESSAGE = correctMessage;
    const result = validateDiscoveredLight(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateDiscoveredLight();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect id", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      id: 123,
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      name: 123,
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect version", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      version: 1,
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect hardware", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      hardware: 8266,
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color order", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      colorOrder: 202,
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect stripType", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      stripType: 2812,
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect ipAddress", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      ipAddress: "10.0.2.855",
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect mac Address", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      macAddress: 802340384392,
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect numLeds", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      numLeds: "abcd",
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect udp port", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      udpPort: "abcde",
    });
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no id", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.id;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no name", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.name;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no version", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.version;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no hardware", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.hardware;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no color order", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.colorOrder;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no stripType", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.stripType;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no ipAddress", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.ipAddress;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no mac Address", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.macAddress;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no numLeds", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.numLeds;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no udp port", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.udpPort;
    const result = validateDiscoveredLight(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});
