import {
  IsInt,
  IsString,
  Length,
  Min,
  Max,
  IsOptional,
  IsArray,
  IsIP,
  Matches,
  IsBoolean,
} from "class-validator";
import uuidv4 from "uuid/v4";

export enum MessageType {
  Connected = "connectedMessage",
  State = "stateMessage",
  EffectList = "effectListMessage",
  Config = "configMessage",
  DiscoveryResponse = "discoveryResponseMessage",
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
  @IsString()
  public mutationId!: string;

  @IsBoolean()
  @IsOptional()
  public on?: boolean;

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
    this.mutationId = uuidv4();
  }
}

export class ConnectedPayload {
  @IsString()
  @Length(1, 255)
  public id!: string;

  @IsBoolean()
  public connected!: boolean;
}

export class StatePayload {
  @IsString()
  @IsOptional()
  public mutationId?: string;

  @IsString()
  @Length(1, 255)
  public id!: string;

  @IsBoolean()
  @IsOptional()
  public on!: boolean;

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
  public id!: string;

  @IsArray()
  @IsString({ each: true })
  public effectList!: string[];
}

export class ConfigPayload {
  @IsString()
  @Length(1, 255)
  public id!: string;

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
