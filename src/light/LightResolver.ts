import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Arg,
  ClassType,
  Root,
  PubSub,
  Publisher,
} from "type-graphql";
import { Service } from "typedi";
import { Light } from "./LightEntity";
import { LightInput } from "./LightInput";
import { LightService } from "./LightService";
import { LIGHT_CHANGED, LIGHT_ADDED, LIGHT_REMOVED } from "./light-events";

@Service()
@Resolver((): ClassType<Light> => Light)
export class LightResolver {
  private lightService: LightService;

  // Dependency injection of the service
  public constructor(lightService: LightService) {
    this.lightService = lightService;
  }

  @Query((): ClassType<Light> => Light, { description: "Get a light by it's ID" })
  public light(@Arg("id") id: string): Promise<Light> {
    return this.lightService.findLightById(id);
  }

  // TODO: Add lights as a property of a Room or Group class so you can order the lights within a group/room
  @Query((): ClassType<Light>[] => [Light], {
    description: "Get all currently added lights in the order they were added",
  })
  public lights(): Promise<Light[]> {
    return this.lightService.findAllLights();
  }

  @Query((): ClassType<Light>[] => [Light], {
    description: "Get all currently added lights in the order they were added",
  })
  public discoveredLights(): Promise<Light[]> {
    return this.lightService.discoverLights(2000);
  }

  @Mutation((): ClassType<Light> => Light, {
    description: "Change some of the light's data (use setLightState to change the state)",
  })
  public setLight(@Arg("id") id: string, @Arg("lightData") lightData: LightInput): Promise<Light> {
    // Subscriptions are updated inside of the lightService class because the light can be updated from MQTT messages
    return this.lightService.changeLight(id, lightData);
  }

  @Mutation((): ClassType<Light> => Light, { description: "Add a new light" })
  public async addLight(
    @Arg("id") id: string,
    @PubSub(LIGHT_ADDED) publish: Publisher<Light>
  ): Promise<Light> {
    // Add the light
    const addedLight = await this.lightService.addNewLight(id);

    // Notify subscriptions
    // This is handled here because this is the only possible way to add a light
    publish(addedLight);

    return addedLight;
  }

  @Mutation((): ClassType<Light> => Light, { description: "Remove a currently added light" })
  public async removeLight(
    @Arg("id") id: string,
    @PubSub(LIGHT_REMOVED) publish: Publisher<Light>
  ): Promise<Light> {
    // Remove the light
    const removedLight = await this.lightService.removeLightById(id);

    // Notify subscriptions
    // This is handled here because this is the only possible way to remove a light
    publish(removedLight);

    return removedLight;
  }

  @Subscription({ topics: LIGHT_CHANGED })
  public lightChanged(@Root() updatedLight: Light): Light {
    return updatedLight;
  }

  @Subscription({ topics: LIGHT_ADDED })
  public lightAdded(@Root() addedLight: Light): Light {
    return addedLight;
  }

  @Subscription({ topics: LIGHT_REMOVED })
  public lightRemoved(@Root() removedLight: Light): Light {
    return removedLight;
  }
}
