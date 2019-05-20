module.exports = {
  toLightObject: light => {
    const plainLight = light.get({ plain: true });
    plainLight.supportedEffects =
      plainLight.supportedEffects.length > 0
        ? plainLight.supportedEffects.split(",")
        : [];
    return plainLight;
  },
  toLightModel: light => {
    if (light.supportedEffects)
      light.supportedEffects = light.supportedEffects.join(",");
    return light;
  }
};
