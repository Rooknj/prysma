const { promisify } = require("util");
const Debug = require("debug").default;
const LightMessenger = require("../messengers/LightMessenger");
const LightDao = require("../daos/LightDao");
const LightCache = require("../caches/LightCache");
const mediator = require("./mediator");
const { getSimpleUniqueId } = require("../lib/lightUtil");
const {
  TIMEOUT_WAIT,
  DISCOVERY_DURATION,
  MUTATION_RESPONSE_EVENT,
  LIGHT_ADDED_EVENT,
  LIGHT_REMOVED_EVENT,
  LIGHT_CHANGED_EVENT,
  LIGHT_STATE_CHANGED_EVENT,
} = require("./serviceConstants");

const asyncSetTimeout = promisify(setTimeout);

const debug = Debug("LightService");

class LightService {
  constructor(config = { mqtt: {} }) {
    const { mqtt } = config;

    // Initialize private variables
    this._dao = new LightDao();
    this._messenger = new LightMessenger(mqtt.topics);
    this._cache = new LightCache();
  }

  async init() {
    // Initialize cache
    const lights = await this._dao.getLights();
    const cacheInitPromises = lights.map(({ id }) => this._cache.initializeLightState(id));
    await Promise.all(cacheInitPromises);

    // Handle connect if the messenger was already connected
    if (this._messenger.connected) {
      this._handleMessengerConnect();
    }

    // Add Event Listeners (This cant be done until everything is set up)
    this._messenger.on("connect", this._handleMessengerConnect.bind(this));
    this._messenger.on("disconnect", this._handleMessengerDisconnect.bind(this));
    this._messenger.on("connectedMessage", this._handleConnectedMessage.bind(this));
    this._messenger.on("stateMessage", this._handleStateMessage.bind(this));
    this._messenger.on("effectListMessage", this._handleEffectListMessage.bind(this));
    this._messenger.on("configMessage", this._handleConfigMessage.bind(this));
    this._messenger.on("discoveryMessage", this._handleDiscoveryMessage.bind(this));
  }

  async getLight(lightId) {
    const light = await this._dao.getLight(lightId);
    return light;
  }

  async getLights() {
    const lights = await this._dao.getLights();
    return lights;
  }

  async getDiscoveredLights() {
    // Initialize the cache
    await this._cache.clearDiscoveredLights();

    // Publish discovery query
    await this._messenger.publishDiscovery();

    // Wait one second for responses to come in
    await asyncSetTimeout(DISCOVERY_DURATION);

    // After one second, return the discovered lights
    const discoveredLights = await this._cache.getDiscoveredLights();
    return discoveredLights;
  }

  async setLight(lightId, lightData) {
    await this._dao.setLight(lightId, lightData);

    // Notify listeners of new light and return it
    const newLight = await this._dao.getLight(lightId);
    mediator.emit(LIGHT_CHANGED_EVENT, newLight);
    return newLight;
  }

  // TODO: Add error handling and cleanup here if something fails
  async addLight(lightId, lightData) {
    let name;
    if (lightData) {
      ({ name } = lightData);
    }

    // Add new light to light database
    await this._dao.addLight(lightId, name);

    const addPromises = [
      // Add a default state to the light
      this._cache.initializeLightState(lightId),
      // Subscribe to new messages from the new light
      this._messenger.subscribeToLight(lightId),
    ];

    try {
      await Promise.all(addPromises);
    } catch (error) {
      // TODO: Figure out what to do if any of these error
      debug(error);
    }

    // Get the newly added light, notify any listeners, and return it
    const lightAdded = await this.getLight(lightId);
    mediator.emit(LIGHT_ADDED_EVENT, lightAdded);
    return lightAdded;
  }

  // TODO: Add error handling and cleanup here if something fails
  async removeLight(lightId) {
    await this._messenger.unsubscribeFromLight(lightId);

    await this._cache.clearLightState(lightId);

    // Notify any listeners of the removed light and return it
    const lightRemoved = await this._dao.removeLight(lightId);
    mediator.emit(LIGHT_REMOVED_EVENT, lightRemoved);
    return lightRemoved;
  }

  async _handleMessengerConnect() {
    try {
      const lights = await this._dao.getLights();

      // Subscribe to all the lights
      const subscriptionPromises = lights.map(({ id }) => this._messenger.subscribeToLight(id));

      // Subscribe to discovery topic
      subscriptionPromises.push(this._messenger.startDiscovery());

      // Wait for all the promises to resolve
      await Promise.all(subscriptionPromises);
    } catch (error) {
      debug("Error handling messenger connect", error);
      throw error;
    }
  }

  async _handleMessengerDisconnect() {
    try {
      const lights = await this._dao.getLights();

      // Set all light's connected status to false, then return the new state
      const setStatePromises = lights.map(
        ({ id }) =>
          new Promise(resolve => {
            this._cache
              .setLightState(id, { connected: false })
              .then(() => this._cache.getLightState(id))
              .then(resolve);
          })
      );

      // Wait for all the promises to resolve
      const setStateResults = await Promise.all(setStatePromises);

      // Notify listeners of the new state
      setStateResults.forEach(newState => mediator.emit(LIGHT_STATE_CHANGED_EVENT, newState));
    } catch (error) {
      debug("Error handling messenger disconnect", error);
      throw error;
    }
  }

  async _handleEffectListMessage(message) {
    const { name, effectList } = message;
    try {
      await this._dao.setLight(name, { supportedEffects: effectList });

      // Notify listeners of new light
      const newLight = await this._dao.getLight(name);
      mediator.emit(LIGHT_CHANGED_EVENT, newLight);
    } catch (error) {
      debug("Error handling Effect List Message", error);
    }
  }

  async _handleConfigMessage(message) {
    const { name, ...config } = message;
    try {
      await this._dao.setLight(name, config);

      // Notify listeners of new light
      const newLight = await this._dao.getLight(name);
      mediator.emit(LIGHT_CHANGED_EVENT, newLight);
    } catch (error) {
      debug("Error handling Config Message", error);
    }
  }

  async _handleDiscoveryMessage(message) {
    let lightIsAlreadyAdded = true;
    try {
      await this._dao.getLight(message.id);
    } catch (error) {
      lightIsAlreadyAdded = false;
    }

    if (lightIsAlreadyAdded) {
      debug(`${message.id} is already added. Ignoring discovery response.`);
      return;
    }

    this._cache.addDiscoveredLight(message);
  }

  /* Light State Section */
  async getLightState(lightId) {
    const lightState = await this._cache.getLightState(lightId);
    return lightState;
  }

  async setLightState(lightId, lightState) {
    // Check if the light exists already before doing anything else
    const currentState = await this._cache.getLightState(lightId);
    if (!currentState) throw new Error(`"${lightId}" was never added`);
    if (!currentState.connected) throw new Error(`"${lightId}" is not connected`);

    // TODO: Implement the hardware to support on instead of state
    // Map the on property to the state property
    let newLightState = lightState;
    if ("on" in newLightState) {
      const { on, ...rest } = newLightState;
      const state = newLightState.on ? "ON" : "OFF";
      newLightState = { state, ...rest };
    }

    // Create the command payload
    const uniqueId = getSimpleUniqueId();
    const payload = { mutationId: uniqueId, name: lightId, ...newLightState };

    // Return a promise which resolves when the light responds to this message or rejects if it takes too long
    return new Promise((resolve, reject) => {
      // Every time we get a new message from the light, check to see if it has the same mutationId
      const handleMutationResponse = ({ mutationId, newState }) => {
        if (mutationId === payload.mutationId) {
          // Remove this mutation's event listener
          mediator.removeListener(MUTATION_RESPONSE_EVENT, handleMutationResponse);
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
            mediator.removeListener(MUTATION_RESPONSE_EVENT, handleMutationResponse);
            reject(new Error(`Response from ${lightId} timed out`));
          }, TIMEOUT_WAIT);
        })
        .catch(error => {
          mediator.removeListener(MUTATION_RESPONSE_EVENT, handleMutationResponse);
          reject(error);
        });

      // if the response takes too long, error out
    });
  }

  async _handleConnectedMessage(message) {
    const { name, ...state } = message;

    // Map the "connected" property from [2,0] to [true, false]
    state.connected = state.connection === 2;
    delete state.connection;

    try {
      // Set the new state
      await this._cache.setLightState(name, state);

      // Notify listeners of new state
      const newState = await this._cache.getLightState(name);
      mediator.emit(LIGHT_STATE_CHANGED_EVENT, newState);
    } catch (error) {
      debug("Error handling Connected Message", error);
    }
  }

  async _handleStateMessage(message) {
    const { name, mutationId, ...state } = message;

    // Map the "state" property to the "on" property
    state.on = state.state === "ON";
    delete state.state;

    try {
      // Set the new state
      await this._cache.setLightState(name, state);

      // Notify listeners of new state
      const newState = await this._cache.getLightState(name);
      mediator.emit(MUTATION_RESPONSE_EVENT, { mutationId, newState });
      mediator.emit(LIGHT_STATE_CHANGED_EVENT, newState);
    } catch (error) {
      debug("Error handling State Message", error);
    }
  }
}

module.exports = LightService;
