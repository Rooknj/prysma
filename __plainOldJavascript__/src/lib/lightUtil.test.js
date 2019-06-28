const lightUtils = require("./lightUtil");

describe("toLightObject", () => {
  test("correctly converts supportedEffects", () => {
    const supportedEffects = "test 1,mock effect,cylon,juggle";
    const expectedEffects = ["test 1", "mock effect", "cylon", "juggle"];
    const LIGHT_MODEL = { supportedEffects };

    const lightObject = lightUtils.toLightObject(LIGHT_MODEL);

    expect(lightObject.supportedEffects).toEqual(expectedEffects);
  });
  test("converts empty supported effects to an empty array", () => {
    const supportedEffects = "";
    const expectedEffects = [];
    const LIGHT_MODEL = { supportedEffects };

    const lightObject = lightUtils.toLightObject(LIGHT_MODEL);

    expect(lightObject.supportedEffects).toEqual(expectedEffects);
  });
});
describe("toLightModel", () => {
  test("correctly converts supportedEffects to a string", () => {
    const supportedEffects = ["test 1", "mock effect", "cylon", "juggle"];
    const expectedEffects = "test 1,mock effect,cylon,juggle";
    const LIGHT_OBJECT = { supportedEffects };

    const lightModel = lightUtils.toLightModel(LIGHT_OBJECT);

    expect(lightModel.supportedEffects).toBe(expectedEffects);
  });
  test("converts empty supported effects to an empty string", () => {
    const supportedEffects = [];
    const expectedEffects = "";
    const LIGHT_OBJECT = { supportedEffects };

    const lightModel = lightUtils.toLightModel(LIGHT_OBJECT);

    expect(lightModel.supportedEffects).toBe(expectedEffects);
  });
});

describe("getSimpleUniqueId", () => {
  test("Returns a number", () => {
    const uniqueId = lightUtils.getSimpleUniqueId();

    expect(typeof uniqueId).toBe("number");
  });
  test("Returns an integer", () => {
    const uniqueId = lightUtils.getSimpleUniqueId();

    expect(parseInt(uniqueId)).toBe(uniqueId);
  });
});
