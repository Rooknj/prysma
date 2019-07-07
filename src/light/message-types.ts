import {
  IsInt,
  IsString,
  Length,
  IsEnum,
  Min,
  Max,
  IsOptional,
  IsIn,
  IsArray,
  IsIP,
  Matches,
} from "class-validator";

export enum MessageType {
  Connected = "connectedMessage",
  State = "stateMessage",
  EffectList = "effectListMessage",
  Config = "configMessage",
  DiscoveryResponse = "discoveryResponseMessage",
}

export enum PowerState {
  on = "ON",
  off = "OFF",
}

export class RGB {
  @IsInt()
  @Min(0)
  @Max(255)
  public r!: number;

  @IsInt()
  @Min(0)
  @Max(255)
  public g!: number;

  @IsInt()
  @Min(0)
  @Max(255)
  public b!: number;
}

export class CommandPayload {
  @IsInt()
  public mutationId!: number;

  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsEnum(PowerState)
  @IsOptional()
  public state?: PowerState;

  @IsOptional()
  public color?: RGB;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public brightness?: number;

  @IsString()
  @IsOptional()
  public effect?: string;

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  public speed?: number;

  public constructor() {
    // TODO: Implement String Uuid on hardware instead of using an int (unless this hurts performance)
    // This is the max number supported by the esp8266 lights (it's 2^32 because its a 32 bit int)
    this.mutationId = Math.floor(Math.random() * 4294967296);
  }
}

export class ConnectionPayload {
  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsIn(["0", "2"])
  public connection!: "0" | "2";
}

export class StatePayload {
  @IsInt()
  @IsOptional()
  public mutationId?: number;

  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsEnum(PowerState)
  @IsOptional()
  public state!: PowerState;

  @IsOptional()
  public color!: RGB;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  public brightness!: number;

  @IsString()
  @IsOptional()
  public effect!: string;

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  public speed!: number;
}

export class EffectListPayload {
  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsArray()
  @IsString({ each: true })
  public effectList!: string[];
}

export class ConfigPayload {
  @IsString()
  @Length(1, 255)
  public id!: string;

  @IsString()
  @Length(1, 255)
  public name!: string;

  @IsString()
  public version!: string;

  @IsString()
  public hardware!: string;

  @IsString()
  public colorOrder!: string;

  @IsString()
  public stripType!: string;

  @IsIP("4")
  public ipAddress!: string;

  @Matches(/^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/)
  public macAddress!: string;

  @IsInt()
  public numLeds!: number;

  @IsInt()
  public udpPort!: number;
}
