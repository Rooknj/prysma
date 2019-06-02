"use strict";
const resolvers = {
  Query: {
    light: (_, { lightId }, { lightService }) => lightService.getLight(lightId),
    lights: (_, args, { lightService }) => lightService.getLights(),
    discoveredLights: (_, args, { lightService }) =>
      lightService.getDiscoveredLights(),
  },
  Mutation: {
    setLight: (_, { lightId, lightData }, { lightService }) =>
      lightService.setLight(lightId, lightData),
    addLight: (_, { lightId, lightData }, { lightService }) =>
      lightService.addLight(lightId, lightData),
    removeLight: (_, { lightId }, { lightService }) =>
      lightService.removeLight(lightId),
    setLightState: (_, { lightId, lightState }, { lightService }) =>
      lightService.setLightState(lightId, lightState),
  },
  Light: {
    state(parent, _, { lightService }) {
      return lightService.getLightState(parent.id);
    },
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, args, { subscriptionService }) => {
        return subscriptionService.subscribeToChangedLights();
      },
    },
    lightAdded: {
      subscribe: (_, args, { subscriptionService }) => {
        return subscriptionService.subscribeToAddedLights();
      },
    },
    lightRemoved: {
      subscribe: (_, args, { subscriptionService }) => {
        return subscriptionService.subscribeToRemovedLights();
      },
    },
    lightStateChanged: {
      subscribe: (_, args, { subscriptionService }) => {
        return subscriptionService.subscribeToChangedLightStates();
      },
    },
  },
};

module.exports = resolvers;
