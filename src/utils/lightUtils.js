module.exports = {
  toLightObject: light => {
    const plainLight = light.get({ plain: true });
    plainLight.supportedEffects =
      plainLight.supportedEffects.length > 0
        ? plainLight.supportedEffects.split(",")
        : [];
    return plainLight;
  }
};
