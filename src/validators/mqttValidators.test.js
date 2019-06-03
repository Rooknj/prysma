const {
  validateConnectedMessage,
  validateStateMessage,
  validateEffectListMessage,
  validateConfigMessage,
  validateDiscoveryMessage,
  validateCommandMessage,
} = require("./mqttValidators");

describe("validateConnectedMessage", () => {
  let correctMessage;
  beforeEach(() => {
    correctMessage = { name: "Prysma-807D3A41B465", connection: 2 };
  });

  test("validates a correct message", () => {
    const CORRECT_MESSAGE = correctMessage;
    const result = validateConnectedMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateConnectedMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no name", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.name;
    const result = validateConnectedMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no connection", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.connection;
    const result = validateConnectedMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect connection", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, { connection: 3 });
    const result = validateConnectedMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, { name: 12345 });
    const result = validateConnectedMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateStateMessage", () => {
  let correctMessage;
  beforeEach(() => {
    correctMessage = {
      mutationId: 5,
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4,
    };
  });

  test("validates a correct message", () => {
    const CORRECT_MESSAGE = correctMessage;
    const result = validateStateMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateStateMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no name", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.name;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no state", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.state;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no color", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.color;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no red", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.color.r;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no green", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.color.g;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no blue", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.color.b;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no brightness", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.brightness;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no effect", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.effect;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no speed", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.speed;
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect mutationId", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      mutationId: "oeafivo pandwopnvo",
    });
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      name: 12345,
    });
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect state", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      state: false,
    });
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      color: { r: 256, g: -3, b: "Hello" },
    });
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect brightness", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      brightness: 101,
    });
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      effect: 4,
    });
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect speed", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      speed: "abc",
    });
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateEffectListMessage", () => {
  let correctMessage;
  beforeEach(() => {
    correctMessage = {
      name: "Prysma-807D3A41B465",
      effectList: [
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
        "Noise",
      ],
    };
  });

  test("validates a correct message", () => {
    const CORRECT_MESSAGE = correctMessage;
    const result = validateEffectListMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateEffectListMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      name: 1234,
    });
    const result = validateEffectListMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect list", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      effectList: "hello",
    });
    const result = validateEffectListMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no name", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.name;
    const result = validateEffectListMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no effect list", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.effectList;
    const result = validateEffectListMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateConfigMessage", () => {
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
    const result = validateConfigMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateConfigMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect id", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      id: 123,
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      name: 123,
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect version", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      version: 1,
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect hardware", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      hardware: 8266,
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color order", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      colorOrder: 202,
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect stripType", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      stripType: 2812,
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect ipAddress", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      ipAddress: "10.0.2.855",
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect mac Address", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      macAddress: 802340384392,
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect numLeds", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      numLeds: "abcd",
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect udp port", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      udpPort: "abcde",
    });
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no id", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.id;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no name", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.name;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no version", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.version;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no hardware", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.hardware;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no color order", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.colorOrder;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no stripType", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.stripType;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no ipAddress", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.ipAddress;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no mac Address", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.macAddress;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no numLeds", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.numLeds;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no udp port", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.udpPort;
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateDiscoveryMessage", () => {
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
    const result = validateDiscoveryMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateDiscoveryMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect id", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      id: 123,
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      name: 123,
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect version", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      version: 1,
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect hardware", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      hardware: 8266,
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color order", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      colorOrder: 202,
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect stripType", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      stripType: 2812,
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect ipAddress", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      ipAddress: "10.0.2.855",
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect mac Address", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      macAddress: 802340384392,
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect numLeds", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      numLeds: "abcd",
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect udp port", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      udpPort: "abcde",
    });
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no id", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.id;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no name", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.name;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no version", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.version;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no hardware", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.hardware;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no color order", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.colorOrder;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no stripType", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.stripType;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no ipAddress", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.ipAddress;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no mac Address", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.macAddress;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no numLeds", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.numLeds;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no udp port", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.udpPort;
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateCommandMessage", () => {
  let correctMessage;
  beforeEach(() => {
    correctMessage = {
      mutationId: 5,
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4,
    };
  });

  test("validates a correct message", () => {
    const CORRECT_MESSAGE = correctMessage;
    const result = validateCommandMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateCommandMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no name", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.name;
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no red", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.color.r;
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no green", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.color.g;
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate a message with no blue", () => {
    const INCORRECT_MESSAGE = correctMessage;
    delete INCORRECT_MESSAGE.color.b;
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect mutationId", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      mutationId: "oeafivo pandwopnvo",
    });
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      name: 12345,
    });
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect state", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      state: false,
    });
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      color: { r: 256, g: -3, b: "Hello" },
    });
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect brightness", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      brightness: 101,
    });
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      effect: 4,
    });
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect speed", () => {
    const INCORRECT_MESSAGE = Object.assign(correctMessage, {
      speed: "abc",
    });
    const result = validateCommandMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});
