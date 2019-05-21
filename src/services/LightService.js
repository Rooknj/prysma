const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");
const mediator = require("./mediator");

const TIMEOUT_WAIT = 5000;
const MUTATION_RESPONSE_EVENT = "mutationResponse";

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

    // Add Event Listeners
    this._messenger.on("connect", this._handleMessengerConnect.bind(this));
    this._messenger.on(
      "connectedMessage",
      this._handleConnectedMessage.bind(this)
    );
    this._messenger.on("stateMessage", this._handleStateMessage.bind(this));
    this._messenger.on(
      "effectListMessage",
      this._handleEffectListMessage.bind(this)
    );
    this._messenger.on("configMessage", this._handleConfigMessage.bind(this));
    this._messenger.on(
      "discoveryMessage",
      this._handleDiscoveryMessage.bind(this)
    );

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
    const light = await this._dao.getLight(lightId);
    return light;
  }

  async getLights() {
    const lights = await this._dao.getLights();
    return lights;
  }

  async getDiscoveredLights() {}

  async setLight(lightId, lightData) {
    await this._dao.setLight(lightId, lightData);
    return this._dao.getLight(lightId);
  }

  // TODO: Add error handling and cleanup here if something fails
  async addLight(lightId, lightData) {
    let name = undefined;
    if (lightData) {
      ({ name } = lightData);
    }

    // Add new light to light database
    await this._dao.addLight(lightId, name);

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

  async getLightState(lightId) {
    const lightState = await this._cache.getLightState(lightId);
    return lightState;
  }

  async setLightState(lightId, lightState) {
    // Check if the light exists already before doing anything else
    const currentState = await this._cache.getLightState(lightId);
    if (!currentState) throw new Error(`"${lightId}" was never added`);
    if (!currentState.connected)
      throw new Error(`"${lightId}" is not connected`);

    // TODO: Implement the hardware to support on instead of state
    // Map the on property to the state property
    if ("on" in lightState) {
      lightState.state = lightState.on ? "ON" : "OFF";
      delete lightState.on;
    }

    // Create the command payload
    const mutationId = getUniqueId();
    const payload = { mutationId, name: lightId, ...lightState };

    //Return a promise which resolves when the light responds to this message or rejects if it takes too long
    return new Promise((resolve, reject) => {
      // Every time we get a new message from the light, check to see if it has the same mutationId
      const handleMutationResponse = ({ mutationId, newState }) => {
        if (mutationId === payload.mutationId) {
          // Remove this mutation's event listener
          mediator.removeListener(
            MUTATION_RESPONSE_EVENT,
            handleMutationResponse
          );

          // Resolve with the light's response data
          resolve(newState);
        }
      };
      mediator.addListener(MUTATION_RESPONSE_EVENT, handleMutationResponse);

      // Publish to the light with a timeout of 5 seconds
      this._messenger
        .publishToLight(lightId, payload)
        .then(() => {
          setTimeout(() => {
            mediator.removeListener(
              MUTATION_RESPONSE_EVENT,
              handleMutationResponse
            );
            reject(new Error(`Response from ${lightId} timed out`));
          }, TIMEOUT_WAIT);
        })
        .catch(error => {
          mediator.removeListener(
            MUTATION_RESPONSE_EVENT,
            handleMutationResponse
          );
          reject(error);
        });

      // if the response takes too long, error out
    });
  }

  async _handleMessengerConnect() {
    try {
      const lights = await this._dao.getLights();
      const subscriptionPromises = lights.map(({ id }) =>
        this._messenger.subscribeToLight(id)
      );
      //subscriptionPromises.push(this._messenger.startDiscovery);
      await Promise.all(subscriptionPromises);
    } catch (error) {
      console.log("Error subscribing to all the lights", error);
      throw error;
    }
  }

  async _handleConnectedMessage(message) {
    const { name, ...state } = message;
    state.connected = state.connection === 2;
    delete state.connection;
    try {
      await this._cache.setLightState(name, state);
    } catch (error) {
      console.log("Error handling Connected Message", error);
    }
  }

  async _handleStateMessage(message) {
    const { name, mutationId, ...state } = message;
    state.on = state.state === "ON";
    delete state.state;
    try {
      await this._cache.setLightState(name, state);
      const newState = await this._cache.getLightState(name);
      mediator.emit(MUTATION_RESPONSE_EVENT, { mutationId, newState });
    } catch (error) {
      console.log("Error handling State Message", error);
    }
  }

  async _handleEffectListMessage(message) {
    const { name, effectList } = message;
    try {
      await this._dao.setLight(name, { supportedEffects: effectList });
    } catch (error) {
      console.log("Error handling Effect List Message", error);
    }
  }

  async _handleConfigMessage(message) {
    const { name, ...config } = message;
    try {
      await this._dao.setLight(name, config);
    } catch (error) {
      console.log("Error handling Config Message", error);
    }
  }

  async _handleDiscoveryMessage(message) {}
}

module.exports = LightService;
