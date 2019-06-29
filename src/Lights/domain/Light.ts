import { Entity, PrimaryColumn, Column } from "typeorm";
import {
  IsBoolean,
  IsHexColor,
  IsString,
  IsInt,
  Min,
  Max,
  Length,
  IsArray,
  IsIP,
  Matches,
  validateSync,
  IsOptional,
} from "class-validator";
import { plainToClass } from "class-transformer";

export interface LightConfigProps {
  supportedEffects: string[];
  ipAddress: string;
  macAddress: string;
  numLeds: number;
  udpPort: number;
  version: string;
  hardware: string;
  colorOrder: string;
  stripType: string;
}

class LightConfig {
  @Column({ type: "simple-array", nullable: true })
  @IsArray()
  @IsString({ each: true })
  @Length(1, 255, { each: true })
  public supportedEffects!: string[];

  @Column({ nullable: true })
  @IsIP("4")
  public ipAddress!: string;

  @Column({ nullable: true })
  @Matches(/^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/)
  public macAddress!: string;

  @Column({ type: "int", nullable: true })
  @IsInt()
  public numLeds!: number;

  @Column({ type: "int", nullable: true })
  @IsInt()
  public udpPort!: number;

  @Column({ nullable: true })
  @IsString()
  public version!: string;

  @Column({ nullable: true })
  @IsString()
  public hardware!: string;

  @Column({ nullable: true })
  @IsString()
  public colorOrder!: string;

  @Column({ nullable: true })
  @IsString()
  public stripType!: string;

  public static create(props: LightConfigProps): LightConfig {
    const lightConfig = plainToClass(LightConfig, props);
    const errors = validateSync(lightConfig);
    if (errors.length > 0) {
      throw errors;
    }
    return lightConfig;
  }

  public static createDefault(): LightConfig {
    const defaultLightConfig: LightConfigProps = {
      supportedEffects: [],
      ipAddress: "0.0.0.0",
      macAddress: "AA:BB:CC:DD:EE:FF",
      numLeds: 60,
      udpPort: 7778,
      version: "0.0.0",
      hardware: "ESP8266",
      colorOrder: "RGB",
      stripType: "WS2812B",
    };
    return plainToClass(LightConfig, defaultLightConfig);
  }
}

export interface LightStateProps {
  connected: boolean;
  on: boolean;
  brightness: number;
  color: string;
  effect: string;
  speed: number;
}

class LightState {
  @Column()
  @IsBoolean()
  public connected!: boolean;

  @Column()
  @IsBoolean()
  public on!: boolean;

  @Column({ type: "int" })
  @IsInt()
  @Min(0)
  @Max(100)
  public brightness!: number;

  @Column()
  @IsHexColor()
  public color!: string;

  @Column()
  @IsString()
  public effect!: string;

  @Column({ type: "int" })
  @IsInt()
  @Min(1)
  @Max(7)
  public speed!: number;

  public static create(props: LightStateProps): LightState {
    const lightState = plainToClass(LightState, props);
    const errors = validateSync(lightState);
    if (errors.length > 0) {
      throw errors;
    }
    return lightState;
  }

  public static createDefault(): LightState {
    const defaultLightState: LightStateProps = {
      connected: false,
      on: false,
      brightness: 100,
      color: "#FFFFFF",
      effect: "None",
      speed: 4,
    };
    return plainToClass(LightState, defaultLightState);
  }
}

export interface LightProps {
  id: string;
  name?: string;
  config?: LightConfigProps;
  state?: LightStateProps;
}

@Entity()
export class Light {
  // TODO: Figure out if i should make these things private and just expose getters and like a getLightProperties method
  @PrimaryColumn({ length: 255 })
  @IsString()
  @Length(1, 255)
  public readonly id!: string;

  @Column({ length: 255 })
  @IsString()
  @Length(1, 255)
  public name!: string;

  @Column((): typeof LightConfig => LightConfig)
  public config!: LightConfig;

  @Column((): typeof LightState => LightState)
  public state!: LightState;

  private constructor(id: string, name: string, state: LightState, config: LightConfig) {
    this.id = id;
    this.name = name;
    this.state = state;
    this.config = config;
  }

  public static create(props: LightProps): Light {
    const { id, name, config, state } = props;

    const lightState = state ? LightState.create(state) : LightState.createDefault();
    const lightConfig = config ? LightConfig.create(config) : LightConfig.createDefault();
    const light = new Light(id, name || id, lightState, lightConfig);

    const errors = validateSync(light);
    if (errors.length > 0) {
      throw errors;
    }

    return light;
  }

  // TODO: Implement logic to use the MQTT broker pubsub (subscribe/unsubscribe/publish) (maybe add a connect/disconnect method)

  // TODO: Implement a way to notify subscribers if this light changes (try extending EventEmitter or have an onChange method/property)

  // TODO: Implement these methods
  public async turnOn() {}

  public async turnOff() {}

  public async changeBrightness() {}

  public async changeColor() {}

  public async changeEffect() {}

  // TODO: Figure out if i want this as a separate function or if i want this to be an option on changeEffect
  public async changeEffectSpeed() {}

  public async changeName() {}

  // TODO: Implement an OrderedLightCollection of some sort which stores all the lights in the order they should be returned to the front end (so that way you can reorder lights
}
