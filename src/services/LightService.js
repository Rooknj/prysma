const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");

class LightService {
  constructor(config) {
    const { db, mqtt } = config;
    this._messenger = new LightMessenger(mqtt.topics);
    this._dao = new LightDao();

    // this._messenger.connect(mqtt.host, mqtt.options);
    // this._dao.connect(db);
  }

  async getLight(lightId) {}

  async getLights() {}

  async getDiscoveredLights() {}

  async setLight(lightId, lightState) {}

  async addLight(lightId) {}

  async removeLight(lightId) {}

  async _handleConnectedMessage(message) {}

  async _handleStateMessage(message) {}

  async _handleEffectListMessage(message) {}

  async _handleConfigMessage(message) {}

  async _handleDiscoveryMessage(message) {}
}

module.exports = LightService;
