"use strict";
const resolvers = {
  Query: {
    light: (_, { lightId }, { lightService }) => lightService.getLight(lightId),
    lights: (_, args, { lightService }) => lightService.getLights(),
    discoveredLights: (_, args, { lightService }) =>
      lightService.getDiscoveredLights()
  },
  Mutation: {
    setLight: (_, { lightId, lightData }, { lightService }) =>
      lightService.setLight(lightId, lightData),
    addLight: (_, { lightId, lightName }, { lightService }) =>
      lightService.addLight(lightId, lightName),
    removeLight: (_, { lightId }, { lightService }) =>
      lightService.removeLight(lightId)
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
