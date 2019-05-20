const { validateLightState } = require("./cacheValidators");

describe("validateLightState", () => {
  let correct_message;
  beforeEach(() => {
    correct_message = {
      connected: true,
      on: false,
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };
  });
  test("validates a correct message", () => {
    const CORRECT_MESSAGE = correct_message;
    const result = validateLightState(CORRECT_MESSAGE);
    expect(result.error).toBeNull();
  });

  test("does not validate an empty message", () => {
    const result = validateLightState();
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect connected", () => {
    const INCORRECT_MESSAGE = Object.assign(correct_message, { connected: 2 });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect on", () => {
    const INCORRECT_MESSAGE = Object.assign(correct_message, {
      on: "ON"
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect color", () => {
    const INCORRECT_MESSAGE = Object.assign(correct_message, {
      color: { r: 256, g: -3, b: "Hello" }
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect brightness", () => {
    const INCORRECT_MESSAGE = Object.assign(correct_message, {
      brightness: 101
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect effect", () => {
    const INCORRECT_MESSAGE = Object.assign(correct_message, {
      effect: 4
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });

  test("does not validate an incorrect speed", () => {
    const INCORRECT_MESSAGE = Object.assign(correct_message, {
      speed: "abc"
    });
    const result = validateLightState(INCORRECT_MESSAGE);
    expect(result.error).not.toBeNull();
  });
});
