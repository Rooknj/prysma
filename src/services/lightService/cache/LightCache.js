const { validateLightState, validateDiscoveredLight } = require("../validators/cacheValidators");
const errors = require("../../../lib/errors");

const { ValidationError } = errors;

class LightCache {
  constructor() {
    this._discoveredLights = [];
    this._lightStates = {};
    this.DEFAULT_LIGHT_STATE = {
      connected: false,
      on: false,
      color: {
        r: 255,
        g: 255,
        b: 255,
      },
      brightness: 100,
      effect: "None",
      speed: 4,
    };
  }

  async getDiscoveredLights() {
    return this._discoveredLights;
  }

  async clearDiscoveredLights() {
    this._discoveredLights = [];
  }

  async addDiscoveredLight(discoveredLight) {
    /*
      When switching to redis, check out https://github.com/hughsk/flat, 
      https://medium.com/@stockholmux/store-javascript-objects-in-redis-with-node-js-the-right-way-1e2e89dbbf64
      Then just use Redis Hashes to store each light object
      And use a redis list to store the id of eafch light
      Or just use JSON.stringify and JSON.parse to store objects
    */
    if (!discoveredLight) throw new Error("No discoveredLight provided");

    const validation = validateDiscoveredLight(discoveredLight);
    if (validation.error) throw new ValidationError(validation.error);

    const alreadyDiscovered = this._discoveredLights.find(light => light.id === discoveredLight.id);
    if (!alreadyDiscovered) {
      this._discoveredLights.push(discoveredLight);
    }
  }

  async removeDiscoveredLight(lightId) {
    if (!lightId) throw new Error("No lightId provided");

    this._discoveredLights = this._discoveredLights.filter(light => light.id !== lightId);
  }

  async getLightState(lightId) {
    if (!lightId) throw new Error("No ID provided");
    const lightState = this._lightStates[lightId];
    if (!lightState || Object.entries(lightState).length === 0) {
      throw new Error(`${lightId}'s state not found in cache`);
    }

    return Object.assign({}, lightState, { id: lightId });
  }

  async setLightState(lightId, lightState) {
    if (!lightId) throw new Error("No ID provided");
    if (!lightState || Object.entries(lightState).length === 0) {
      throw new Error("No State provided");
    }

    const validation = validateLightState(lightState);
    if (validation.error) throw new ValidationError(validation.error);

    this._lightStates[lightId] = Object.assign({}, this._lightStates[lightId], lightState);
  }

  async initializeLightState(lightId) {
    this._lightStates[lightId] = this.DEFAULT_LIGHT_STATE;
  }

  async clearLightState(lightId) {
    delete this._lightStates[lightId];
  }
}

module.exports = LightCache;
