const { validateLightState } = require("../validators/cacheValidators");
const Debug = require("debug").default;

const debug = Debug("LightCache");

class LightCache {
  constructor() {
    this._lightStates = {};
    this.DEFAULT_LIGHT_STATE = {
      on: false,
      color: {
        r: 255,
        g: 255,
        b: 255
      },
      brightness: 100,
      effect: "None",
      speed: 4
    };
  }

  async connect(options) {
    debug(`Connecting to Cache with options ${options}...`);
    debug(`Connected to Cache`);
    return;
  }

  async getLightState(lightId) {
    if (!lightId) throw new Error("No ID provided");
    const lightState = this._lightStates[lightId];
    if (!lightState) throw new Error(`${lightId}'s state not found in cache`);

    const validation = validateLightState(lightState);
    if (!validation) throw new Error(`Error Validating the state`);
    if (validation.error) throw validation.error;

    return Object.assign({}, lightState, { id: lightId });
  }

  async setLightState(lightId, lightState) {
    if (!lightId) throw new Error("No ID provided");
    if (!lightState) throw new Error("No State provided");

    const validation = validateLightState(lightState);
    if (!validation) throw new Error(`Error Validating the state`);
    if (validation.error) throw validation.error;

    this._lightStates[lightId] = Object.assign(
      {},
      this._lightStates[lightId],
      lightState
    );
  }

  async initializeLightState(lightId) {
    this._lightStates[lightId] = this.DEFAULT_LIGHT_STATE;
  }

  async clearLightState(lightId) {
    delete this._lightStates[lightId];
  }
}

module.exports = LightCache;
