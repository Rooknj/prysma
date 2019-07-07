import { plainToClass } from "class-transformer";
import {
  RGB,
  CommandPayload,
  PowerState,
  StatePayload,
  ConnectionPayload,
  EffectListPayload,
  ConfigPayload,
} from "./message-types";
import { LightInput } from "./LightInput";
import { Light } from "./LightEntity";

export const hexStringToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const rgbObject: object = result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : // If it can't parse the hex string, just return white
      {
        r: 255,
        g: 255,
        b: 255,
      };
  return plainToClass(RGB, rgbObject);
};

const componentToHex = (c: number): string => {
  const hex = c.toString(16).toUpperCase();
  return hex.length === 1 ? `0${hex}` : hex;
};

export const rgbToHexString = (rgb: RGB): string => {
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
};

export const onToPowerState = (on: boolean | undefined): PowerState => {
  return on ? PowerState.on : PowerState.off;
};

export const powerStateToOn = (state: PowerState): boolean => {
  return state === PowerState.on;
};

export const lightInputToCommandPayload = (id: string, lightInput: LightInput): CommandPayload => {
  const { on, brightness, color, effect, speed } = lightInput;
  const publishPayload = new CommandPayload();
  publishPayload.name = id;

  // Need to check if the properties are in lightStateInput because they can be falsy values like false or 0
  if ("on" in lightInput) {
    // TODO: Implement the hardware to support on instead of state
    publishPayload.state = onToPowerState(on);
  }
  if ("brightness" in lightInput) {
    publishPayload.brightness = brightness;
  }
  if (color) {
    publishPayload.color = hexStringToRgb(color);
  }
  if ("effect" in lightInput) {
    publishPayload.effect = effect;
  }
  if ("speed" in lightInput) {
    publishPayload.speed = speed;
  }

  return publishPayload;
};

export const connectionPayloadToLightFields = (
  connectionPayload: ConnectionPayload
): Partial<Light> => {
  return { connected: connectionPayload.connection === "2" };
};

export const statePayloadToLightFields = (statePayload: StatePayload): Partial<Light> => {
  return {
    on: powerStateToOn(statePayload.state),
    brightness: statePayload.brightness,
    color: rgbToHexString(statePayload.color),
    effect: statePayload.effect,
    speed: statePayload.speed,
  };
};

export const effectListPayloadToLightFields = (
  effectListPayload: EffectListPayload
): Partial<Light> => {
  return { supportedEffects: effectListPayload.effectList };
};
export const configPayloadToLightFields = (configPayload: ConfigPayload): Partial<Light> => {
  return {
    version: configPayload.version,
    hardware: configPayload.hardware,
    colorOrder: configPayload.colorOrder,
    stripType: configPayload.stripType,
    ipAddress: configPayload.ipAddress,
    macAddress: configPayload.macAddress,
    numLeds: configPayload.numLeds,
    udpPort: configPayload.udpPort,
  };
};
