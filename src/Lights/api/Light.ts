import { ObjectType, Field, ID, Int } from "type-graphql";
import { GraphQLScalarType } from "graphql";

@ObjectType({ description: "Object representing a Light" })
export class Light {
  @Field((): GraphQLScalarType => ID)
  public readonly id!: string;

  @Field({ description: "The display name of the Light" })
  public name!: string;

  @Field({ description: "Whether the light is connected to the MQTT broker or not" })
  public connected!: boolean;

  @Field({ description: "Whether the light is switched on or not" })
  public on!: boolean;

  @Field((): GraphQLScalarType => Int, {
    description: "The brightness of the light as a percentage from 0-100",
  })
  public brightness!: number;

  @Field({ description: "The current color of the light in hexadecimal notation" })
  public color!: string;

  @Field({ description: "The currently playing effect of the light" })
  public effect!: string;

  @Field((): GraphQLScalarType => Int, {
    description: "The speed of the currently playing effect from 1-7",
  })
  public speed!: number;

  @Field({ description: "The firmware version the light's controller is running" })
  public firmwareVersion!: string;

  // supportedEffects must be defined. It can either be an empty array or have some values
  @Field((): StringConstructor[] => [String], {
    description: "The list of effects the light can play",
  })
  public supportedEffects!: string[];

  @Field((): GraphQLScalarType => Int, { description: "The number of LEDs the light has" })
  public numLeds!: number;

  @Field({ description: "The IP Address of the light's controller" })
  public ipAddress!: string;

  @Field({ description: "The MAC Address of the light's controller" })
  public macAddress!: string;

  @Field((): GraphQLScalarType => Int, {
    description: "The UDP port the light is listening on for music visualization data",
  })
  public udpPort!: number;

  @Field({ description: "The hardware of the light's controller" })
  public hardware!: string;

  @Field({ description: "The type of LED strip the light is ex: WS2812B, APA102" })
  public stripType!: string;

  @Field({ description: "The order of colors the light strip runs on ex: RGB, GRB, BGR" })
  public colorOrder!: string;
}
