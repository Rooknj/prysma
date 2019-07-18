import { ObjectType, Field, ID, Int } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";
import {
  IsBoolean,
  IsInt,
  IsHexColor,
  IsString,
  Length,
  Min,
  Max,
  IsArray,
  IsIP,
  Matches,
} from "class-validator";

@Entity()
@ObjectType({ description: "Object representing a Light" })
export class Light extends BaseEntity {
  @PrimaryColumn({ length: 255 })
  @Field((): GraphQLScalarType => ID)
  @Length(1, 255)
  public readonly id!: string;

  @Column({ length: 255 })
  @Field({ description: "The display name of the Light" })
  @Length(1, 255)
  public name!: string;

  @Column()
  @Field({ description: "Whether the light is connected to the MQTT broker or not" })
  @IsBoolean()
  public connected!: boolean;

  @Column()
  @Field({ description: "Whether the light is switched on or not" })
  @IsBoolean()
  public on!: boolean;

  @Column({ type: "int" })
  @Field((): GraphQLScalarType => Int, {
    description: "The brightness of the light as a percentage from 0-100",
  })
  @IsInt()
  @Min(0)
  @Max(100)
  public brightness!: number;

  @Column()
  @Field({ description: "The current color of the light in hexadecimal notation" })
  @IsHexColor()
  public color!: string;

  @Column()
  @Field({ description: "The currently playing effect of the light" })
  @IsString()
  public effect!: string;

  @Column({ type: "int" })
  @Field((): GraphQLScalarType => Int, {
    description: "The speed of the currently playing effect from 1-7",
  })
  @IsInt()
  @Min(1)
  @Max(7)
  public speed!: number;

  @Column({ type: "simple-array" })
  @Field((): StringConstructor[] => [String], {
    description: "The list of effects the light can play",
  })
  @IsArray()
  @IsString({ each: true })
  public supportedEffects!: string[];

  @Column()
  @Field({ description: "The IP Address of the light's controller" })
  @IsIP("4")
  public ipAddress!: string;

  @Column()
  @Field({ description: "The MAC Address of the light's controller" })
  @Matches(/^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/)
  public macAddress!: string;

  @Column({ type: "int" })
  @Field((): GraphQLScalarType => Int, {
    description: "The number of LEDs the light has",
  })
  @IsInt()
  public numLeds!: number;

  @Column({ type: "int" })
  @Field((): GraphQLScalarType => Int, {
    description: "The UDP port the light is listening on for music visualization data",
  })
  @IsInt()
  public udpPort!: number;

  @Column()
  @Field({ description: "The firmware version the light's controller is running" })
  @IsString()
  public version!: string;

  @Column()
  @Field({ description: "The hardware of the light's controller" })
  @IsString()
  public hardware!: string;

  @Column()
  @Field({
    description: "The order of colors the light strip runs on ex: RGB, GRB, BGR",
  })
  @IsString()
  public colorOrder!: string;

  @Column()
  @Field({ description: "The type of LED strip the light is ex: WS2812B, APA102" })
  @IsString()
  public stripType!: string;

  public static createDefaultLight(id: string): Light {
    const defaultLightData: Partial<Light> = {
      id,
      name: id,
      connected: false,
      on: false,
      color: "#FFFFFF",
      brightness: 100,
      effect: "None",
      speed: 4,
      supportedEffects: [],
      ipAddress: "0.0.0.0",
      macAddress: "AA:AA:AA:AA:AA:AA",
      udpPort: 0,
      numLeds: 0,
      version: "0.0.0",
      hardware: "8266",
      colorOrder: "RGB",
      stripType: "WS2812B",
    };
    return this.create(defaultLightData);
  }
}
