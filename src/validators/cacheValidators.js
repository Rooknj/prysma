const Joi = require("@hapi/joi");

// Light Validation Constants
const lightId = Joi.string();
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

// Light State Validation
const lightStateSchema = Joi.object()
  .keys({
    id: lightId.required(),
    on: lightOn.required(),
    color: lightColor.required(),
    brightness: lightBrightness.required(),
    effect: lightEffect.required(),
    speed: lightSpeed.required()
  })
  .required();
const validateLightState = msg => Joi.validate(msg, lightStateSchema);

module.exports = {
  validateLightState
};
