const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");

class LightService {
  constructor() {
    this._dao = undefined;
    this._messenger = undefined;
  }

  async init(config) {
    const { db, mqtt } = config;

    // Initialize private variables
    this._dao = new LightDao();
    this._messenger = new LightMessenger(mqtt.topics);

    // Connect to messenger and db
    this._messenger.connect(mqtt.host, mqtt.options);
    await this._dao.connect(db);
  }

  async getLight(lightId) {}

  async getLights() {}

  async getDiscoveredLights() {}

  async setLight(lightId, lightState) {}

  async addLight(lightId) {}

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
