const {
  validateConnectedMessage,
  validateStateMessage,
  validateEffectListMessage,
  validateConfigMessage,
  validateDiscoveryMessage
} = require("./mqttValidators");

describe("validateConnectedMessage", () => {
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = { name: "Prysma-807D3A41B465", connection: 2 };
    const result = validateConnectedMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateConnectedMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect connection", () => {
    const INCORRECT_MESSAGE = { name: "Prysma-807D3A41B465", connection: 3 };
    const result = validateConnectedMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = { name: 12345, connection: 2 };
    const result = validateConnectedMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateStateMessage", () => {
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = {
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const result = validateStateMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateStateMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = {
      name: 12345,
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect state", () => {
    const INCORRECT_MESSAGE = {
      name: "Prysma-807D3A41B465",
      state: false,
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color", () => {
    const INCORRECT_MESSAGE = {
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 256, g: -3, b: "Hello" },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect brightness", () => {
    const INCORRECT_MESSAGE = {
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 101,
      effect: "None",
      speed: 4
    };
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect", () => {
    const INCORRECT_MESSAGE = {
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: 4,
      speed: 4
    };
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect speed", () => {
    const INCORRECT_MESSAGE = {
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: "abc"
    };
    const result = validateStateMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateEffectListMessage", () => {
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = {
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
        "Noise"
      ]
    };
    const result = validateEffectListMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateEffectListMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = {
      name: 1234,
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
        "Noise"
      ]
    };
    const result = validateEffectListMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect list", () => {
    const INCORRECT_MESSAGE = {
      name: 1234,
      effectList: "hello"
    };
    const result = validateEffectListMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateConfigMessage", () => {
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateConfigMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect id", () => {
    const INCORRECT_MESSAGE = {
      id: 123,
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: 123,
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect version", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: 1,
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect hardware", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: 8266,
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color order", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: 202,
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect stripType", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: 2812,
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect ipAddress", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.855",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect mac Address", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: 802340384392,
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect numLeds", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: "abcd",
      udpPort: 7778
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect udp port", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: "abcde"
    };
    const result = validateConfigMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});

describe("validateDiscoveryMessage", () => {
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateDiscoveryMessage();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect id", () => {
    const INCORRECT_MESSAGE = {
      id: 123,
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect name", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: 123,
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect version", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: 1,
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect hardware", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: 8266,
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color order", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: 202,
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect stripType", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: 2812,
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect ipAddress", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.855",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect mac Address", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: 802340384392,
      numLeds: 120,
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect numLeds", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: "abcd",
      udpPort: 7778
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect udp port", () => {
    const INCORRECT_MESSAGE = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: "abcde"
    };
    const result = validateDiscoveryMessage(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});
