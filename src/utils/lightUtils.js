module.exports = {
  toLightObject: light => {
    const plainLight = Object.assign({}, light.get({ plain: true }));
    plainLight.supportedEffects =
      plainLight.supportedEffects.length > 0
        ? plainLight.supportedEffects.split(",")
        : [];
    return plainLight;
  },
  toLightModel: light => {
    const lightModel = Object.assign({}, light);
    if ("supportedEffects" in lightModel)
      lightModel.supportedEffects = lightModel.supportedEffects.join(",");
    return lightModel;
  }
};
