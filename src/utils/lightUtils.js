module.exports = {
  toLightObject: lightModel => {
    const plainLight = Object.assign({}, lightModel);
    plainLight.supportedEffects =
      plainLight.supportedEffects.length > 0 ? plainLight.supportedEffects.split(",") : [];
    return plainLight;
  },
  toLightModel: lightObject => {
    const lightModel = Object.assign({}, lightObject);
    if ("supportedEffects" in lightModel)
      lightModel.supportedEffects = lightModel.supportedEffects.join(",");
    return lightModel;
  },
  getSimpleUniqueId: () => {
    // This is the max number supported by the esp8266 lights (it's 2^32 because its a 32 bit int)
    return Math.floor(Math.random() * 4294967296);
  },
};
