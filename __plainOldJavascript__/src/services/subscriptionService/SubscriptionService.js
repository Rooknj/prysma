const { PubSub } = require("graphql-subscriptions");
const mediator = require("../mediator");
const {
  LIGHT_ADDED_EVENT,
  LIGHT_REMOVED_EVENT,
  LIGHT_CHANGED_EVENT,
  LIGHT_STATE_CHANGED_EVENT,
} = require("../serviceConstants");

class SubscriptionService {
  constructor() {
    this._gqlPubSub = new PubSub();
  }

  init() {
    mediator.on(LIGHT_CHANGED_EVENT, this._onLightChanged.bind(this));
    mediator.on(LIGHT_ADDED_EVENT, this._onLightAdded.bind(this));
    mediator.on(LIGHT_REMOVED_EVENT, this._onLightRemoved.bind(this));
    mediator.on(LIGHT_STATE_CHANGED_EVENT, this._onLightStateChanged.bind(this));
  }

  subscribeToChangedLights() {
    return this._gqlPubSub.asyncIterator(LIGHT_CHANGED_EVENT);
  }

  subscribeToAddedLights() {
    return this._gqlPubSub.asyncIterator(LIGHT_ADDED_EVENT);
  }

  subscribeToRemovedLights() {
    return this._gqlPubSub.asyncIterator(LIGHT_REMOVED_EVENT);
  }

  subscribeToChangedLightStates() {
    return this._gqlPubSub.asyncIterator(LIGHT_STATE_CHANGED_EVENT);
  }

  _onLightChanged(changedLight) {
    this._gqlPubSub.publish(LIGHT_CHANGED_EVENT, {
      lightChanged: changedLight,
    });
  }

  _onLightAdded(addedLight) {
    this._gqlPubSub.publish(LIGHT_ADDED_EVENT, { lightAdded: addedLight });
  }

  _onLightRemoved(removedLight) {
    this._gqlPubSub.publish(LIGHT_REMOVED_EVENT, {
      lightRemoved: removedLight,
    });
  }

  _onLightStateChanged(changedState) {
    this._gqlPubSub.publish(LIGHT_STATE_CHANGED_EVENT, {
      lightStateChanged: changedState,
    });
  }
}

module.exports = SubscriptionService;
