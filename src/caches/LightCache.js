const { validateLightState } = require("../validators/cacheValidators");

class LightCache {
  constructor() {
    this._lightStates = {};
  }

  async getLightState(lightId) {
    if (!lightId) throw new Error("No ID provided");
    const lightState = this._lightStates[lightId];

    if (!lightState) throw new Error(`${lightId}'s state not found in cache`);

    const validation = validateLightState(lightState);
    if (!validation) throw new Error(`Error Validating the state`);
    if (validation.error) throw validation.error;

    return lightState;
  }

  async setLightState(lightId, lightState) {
    if (!lightId) throw new Error("No ID provided");
    if (!lightState) throw new Error("No State provided");

    const validation = validateLightState(lightState);
    if (!validation) throw new Error(`Error Validating the state`);
    if (validation.error) throw validation.error;

    this._lightStates[lightId] = lightState;
  }
}

module.exports = LightCache;
