const Joi = require("@hapi/joi");

// Light Validation Constants
const lightConnected = Joi.boolean();
const lightOn = Joi.boolean();
const lightColor = Joi.object().keys({
  r: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .required(),
  g: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .required(),
  b: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .required(),
});
const lightBrightness = Joi.number()
  .integer()
  .min(0)
  .max(100);
const lightEffect = Joi.string();
const lightSpeed = Joi.number()
  .integer()
  .min(1)
  .max(7);

// Light State Validation
const lightStateSchema = Joi.object()
  .keys({
    connected: lightConnected,
    on: lightOn,
    color: lightColor,
    brightness: lightBrightness,
    effect: lightEffect,
    speed: lightSpeed,
  })
  .required();
const validateLightState = msg => Joi.validate(msg, lightStateSchema);

// TODO: Figure out if i need to export these lightId and lightVersion stuff to a common file.
// DiscoveredLight Validation
const lightId = Joi.string();
const lightVersion = Joi.string();
const lightHardware = Joi.string();
const lightColorOrder = Joi.string();
const lightStripType = Joi.string();
const lightIpAddress = Joi.string().ip();
const lightMacAddress = Joi.string();
const lightNumLeds = Joi.number()
  .integer()
  .min(1);
const lightUdpPort = Joi.number();
const discoveredLightSchema = Joi.object()
  .keys({
    id: lightId.required(),
    name: lightId.required(),
    version: lightVersion.required(),
    hardware: lightHardware.required(),
    colorOrder: lightColorOrder.required(),
    stripType: lightStripType.required(),
    ipAddress: lightIpAddress.required(),
    macAddress: lightMacAddress.required(),
    numLeds: lightNumLeds.required(),
    udpPort: lightUdpPort.required(),
  })
  .required();
const validateDiscoveredLight = msg => Joi.validate(msg, discoveredLightSchema);

module.exports = {
  validateLightState,
  validateDiscoveredLight,
};
