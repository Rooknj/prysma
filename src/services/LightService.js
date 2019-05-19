const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");

const mapToGraphqlLight = (lightData, state) => {
  const { id, name, ...configuration } = lightData;
  return { id, name, state, configuration };
};

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

    // Connect to db and cache
    const connectionPromises = [
      this._dao.connect(db),
      this._cache.connect(cache)
    ];
    await Promise.all(connectionPromises);

    // Initialize cache
    const lights = await this._dao.getLights();
    lights.forEach(({ id }) => {
      this._cache.initializeLightState(id);
    });

    // Connect to messenger
    this._messenger.connect(mqtt.host, mqtt.options);
  }

  async getLight(lightId) {
    const promises = [
      this._dao.getLight(lightId),
      this._cache.getLightState(lightId)
    ];

    const [lightData, lightState] = await Promise.all(promises);
    return mapToGraphqlLight(lightData, lightState);
  }

  async getLights() {
    // Get all the lights data
    const lightsData = await this._dao.getLights();

    // Get all the state info for each light then add it to a nested array with lightData
    const lights = await Promise.all(
      lightsData.map(lightData =>
        Promise.all([lightData, this._cache.getLightState(lightData.id)])
      )
    );

    // Return graphql
    return lights.map(([lightData, lightState]) =>
      mapToGraphqlLight(lightData, lightState)
    );
  }

  async getDiscoveredLights() {}

  async setLight(lightId, lightState) {}

  // TODO: Add error handling and cleanup here if something fails
  async addLight(lightId, lightName) {
    // Add new light to light database
    await this._dao.addLight(lightId, lightName);

    // Add a default state to the light
    await this._cache.initializeLightState(lightId);

    // Subscribe to new messages from the new light
    await this._messenger.subscribeToLight(lightId);

    // Get the newly added light and return it
    const lightAdded = await this.getLight(lightId);
    return lightAdded;
  }

  // TODO: Add error handling and cleanup here if something fails
  async removeLight(lightId) {
    await this._messenger.unsubscribeFromLight(lightId);

    await this._cache.clearLightState(lightId);

    const lightRemoved = await this._dao.removeLight(lightId);

    return lightRemoved;
  }

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
