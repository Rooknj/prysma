const Joi = require("@hapi/joi");

// Light Validation Constants
const lightId = Joi.string();
const lightState = Joi.string().valid("OFF", "ON");
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
    .required()
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

// Connected Validation
const connectedMessageSchema = Joi.object()
  .keys({
    name: lightId.required(),
    connection: Joi.number().valid(0, 2)
  })
  .required();

const validateConnectedMessage = msg =>
  Joi.validate(msg, connectedMessageSchema);

// State Validation
const stateMessageSchema = Joi.object()
  .keys({
    name: lightId.required(),
    state: lightState.required(),
    color: lightColor.required(),
    brightness: lightBrightness.required(),
    effect: lightEffect.required(),
    speed: lightSpeed.required()
  })
  .required();
const validateStateMessage = msg => Joi.validate(msg, stateMessageSchema);

// Effect List Validation
const effectListMessageSchema = Joi.object()
  .keys({
    name: lightId.required(),
    effectList: Joi.array()
      .items(Joi.string())
      .required()
  })
  .required();
const validateEffectListMessage = msg =>
  Joi.validate(msg, effectListMessageSchema);

// Config Validation
const configMessageSchema = Joi.object()
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
    udpPort: lightUdpPort.required()
  })
  .required();
const validateConfigMessage = msg => Joi.validate(msg, configMessageSchema);

// Discovery Validation
const discoveryMessageSchema = Joi.object()
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
    udpPort: lightUdpPort.required()
  })
  .required();
const validateDiscoveryMessage = msg =>
  Joi.validate(msg, discoveryMessageSchema);

module.exports = {
  validateConnectedMessage,
  validateStateMessage,
  validateEffectListMessage,
  validateConfigMessage,
  validateDiscoveryMessage
};
