"use strict";
const resolvers = {
  Query: {
    light: (_, { lightId }, { lightService }) => lightService.getLight(lightId),
    lights: (_, args, { lightService }) => lightService.getLights(),
    discoveredLights: (_, args, { lightService }) =>
      lightService.getDiscoveredLights()
  },
  Mutation: {
    setLight: (_, { lightId, lightName }, { lightService }) =>
      lightService.setLight(lightId, lightName),
    addLight: (_, { lightId, lightName }, { lightService }) =>
      lightService.addLight(lightId, lightName),
    removeLight: (_, { lightId }, { lightService }) =>
      lightService.removeLight(lightId),
    setLightState: (_, { lightId, lightState }, { lightService }) =>
      lightService.setLightState(lightId, lightState)
  },
  Light: {
    state(parent, _, { lightService }) {
      return lightService.getLightState(parent.id);
    }
  }
  // Subscription: {
  //   lightChanged: {
  //     subscribe: (_, { lightId }, { subscriptionService }) => {
  //       return subscriptionService.subscribeToLight(lightId);
  //     }
  //   },
  //   lightsChanged: {
  //     subscribe: (_, args, { subscriptionService }) => {
  //       return subscriptionService.subscribeToAllLights();
  //     }
  //   },
  //   lightAdded: {
  //     subscribe: (_, args, { subscriptionService }) => {
  //       return subscriptionService.subscribeToLightsAdded();
  //     }
  //   },
  //   lightRemoved: {
  //     subscribe: (_, args, { subscriptionService }) => {
  //       return subscriptionService.subscribeToLightsRemoved();
  //     }
  //   }
  // }
};

module.exports = resolvers;
