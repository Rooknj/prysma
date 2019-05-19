const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");

class LightService {
  constructor() {
    this._dao = undefined;
    this._messenger = undefined;
    this._cache = undefined;
  }

  async init(config) {
    const { db, mqtt, cache } = config;

    // Initialize private variables
    this._dao = new LightDao();
    this._messenger = new LightMessenger(mqtt.topics);
    this._cache = new LightCache();

    // Connect to messenger and db
    this._messenger.connect(mqtt.host, mqtt.options);
    const connectionPromises = [
      this._dao.connect(db),
      this._cache.connect(cache)
    ];
    await Promise.all(connectionPromises);
  }

  async getLight(lightId) {
    return this._dao.getLight(lightId);
  }

  async getLights() {
    return this._dao.getLights();
  }

  async getDiscoveredLights() {}

  async setLight(lightId, lightState) {}

  async addLight(lightId) {
    // Add new light to light database
    await this._dao.addLight(lightId);

    // Subscribe to new messages from the new light
    await this._messenger.subscribeToLight(lightId);

    // Get the newly added light and return it
    const lightAdded = await self.getLight(lightId);
    mediator.publish(LIGHT_ADDED, {
      lightAdded
    });
    return lightAdded;
  }

  async removeLight(lightId) {}

  async _handleMessengerConnect() {
    console.log("Messenger Connected");
  }

  async _handleMessengerDisconnect() {
    console.log("Messenger Disconnected");
  }

  async _handleConnectedMessage(message) {}

  async _handleStateMessage(message) {}

  async _handleEffectListMessage(message) {}

  async _handleConfigMessage(message) {}

  async _handleDiscoveryMessage(message) {}
}

module.exports = LightService;
