import { InputType, Field, Int } from "type-graphql";
import { GraphQLScalarType } from "graphql";
import { Length, Min, IsInt, Max, IsBoolean, IsHexColor, IsString } from "class-validator";
import { Light } from "./Light";

@InputType()
export class LightInput implements Partial<Light> {
  @Field({ nullable: true, description: "Set the display name of the light" })
  @Length(1, 255)
  public name?: string;

  @Field({ nullable: true, description: "Power the light on or off" })
  @IsBoolean()
  public on?: boolean;

  @Field((): GraphQLScalarType => Int, {
    nullable: true,
    description: "Change the brightness of the light (a value 0-100)",
  })
  @Min(0)
  @Max(100)
  public brightness?: number;

  @Field({
    nullable: true,
    description: "Change the color of the light (must be in hexadecimal format)",
  })
  @IsHexColor()
  public color?: string;

  @Field({ nullable: true, description: "Change the currently playing effect of the light" })
  @IsString()
  public effect?: string;

  @Field((): GraphQLScalarType => Int, {
    nullable: true,
    description: "Change the speed of the light (a value 1-7)",
  })
  @IsInt()
  @Min(1)
  @Max(7)
  public speed?: number;
}
