const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");

const mapToGraphqlLight = (lightData, state) => {
  const { id, name, ...configuration } = lightData;
  return { id, name, state, configuration };
};

let mutationId = 0;
const getUniqueId = () => {
  mutationId += 1;
  return mutationId;
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

  async setLight(lightId, lightState) {
    // Check if the light exists already before doing anything else
    const currentState = await this._cache.getLightState(lightId);
    if (!currentState) throw new Error(`"${lightId}" was never added`);
    //if (!currentState.connected) throw new Error(`"${lightId}" is not connected`);

    // Create the command payload
    const mutationId = getUniqueId();
    if ("on" in lightState) {
      lightState.state = lightState.on ? "ON" : "OFF";
      delete lightState.on;
    }
    let payload = { mutationId, name: lightId, ...lightState };
    console.log(payload);

    // Return a promise which resolves when the light responds to this message or rejects if it takes too long
    // return new Promise(async (resolve, reject) => {
    //   const handleMutationResponse = ({ mutationId, changedLight }) => {
    //     if (mutationId === payload.mutationId) {
    //       // Remove this mutation's event listener
    //       mediator.unsubscribe("mutationResponse", handleMutationResponse);

    //       // Resolve with the light's response data
    //       resolve(changedLight);
    //     }
    //   };

    //   // Set the light's name if provided
    //   if (lightData.name) {
    //     const error = await db.setLight(id, { name: lightData.name });
    //     if (error) {
    //       reject(error);
    //       return error;
    //     }
    //   }

    //   // If only the name was changed or nothing was sent, just return the current state of the light
    //   if (Object.keys(payload).length <= 2) {
    //     const { error, light } = await db.getLight(id);
    //     if (error) {
    //       reject(error);
    //       return error;
    //     }
    //     resolve(light);
    //     mediator.publish(LIGHT_CHANGED, { lightChanged: light });
    //     return null;
    //   }

    //   // If we need to send data directly to the light, continue here
    //   // Every time we get a new message from the light, check to see if it has the same mutationId
    //   mediator.subscribe("mutationResponse", handleMutationResponse);
    //   // Publish to the light
    //   const error = await pubsub.publishToLight(id, payload);
    //   if (error) reject(error);

    //   // if the response takes too long, error out
    //   await asyncSetTimeout(TIMEOUT_WAIT);
    //   mediator.unsubscribe("mutationResponse", handleMutationResponse);
    //   reject(new Error(`Response from ${id} timed out`));
    // });
  }

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
