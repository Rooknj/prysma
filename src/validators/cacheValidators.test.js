const { validateLightState } = require("./cacheValidators");

describe("validateLightState", () => {
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = {
      on: false,
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const result = validateLightState(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateLightState();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect on", () => {
    const INCORRECT_MESSAGE = {
      on: "ON",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color", () => {
    const INCORRECT_MESSAGE = {
      on: false,
      color: { r: 256, g: -3, b: "Hello" },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect brightness", () => {
    const INCORRECT_MESSAGE = {
      on: false,
      color: { r: 255, g: 0, b: 0 },
      brightness: 101,
      effect: "None",
      speed: 4
    };
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect", () => {
    const INCORRECT_MESSAGE = {
      on: false,
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: 4,
      speed: 4
    };
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect speed", () => {
    const INCORRECT_MESSAGE = {
      on: false,
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: "abc"
    };
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});
