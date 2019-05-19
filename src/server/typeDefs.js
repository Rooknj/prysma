"use strict";
const { gql } = require("apollo-server-express");

const Query = gql`
  type Query {
    light(lightId: String!): Light
    lights: [Light]
    discoveredLights: [DiscoveredLight]
  }
`;

const Mutation = gql`
  type Mutation {
    setLight(lightId: String!, lightState: LightStateInput!): Light
    addLight(lightId: String!, lightName: String): Light
    removeLight(lightId: String!): RemovedLight
    updateHub: String
    rebootHub: String
  }
`;

const Subscription = gql`
  type Subscription {
    lightChanged(lightId: String!): Light
    lightsChanged: Light
    lightAdded: Light
    lightRemoved: String
  }
`;

const Light = gql`
  type Light {
    id: String # uique id of accessory
    name: String # user given name of accessory
    supportedEffects: [String] # List of supported effects
    state: LightState
    configuration: LightConfig
  }
`;

const LightState = gql`
  type LightState {
    connected: Boolean
    on: Boolean # curent power status
    brightness: Int # current brightness
    color: Color # current color
    effect: String # current effect
    speed: Int # effect speed
  }
`;

const LightConfig = gql`
  type LightConfig {
    ipAddress: String
    macAddress: String
    numLeds: Int
    udpPort: Int
    version: String
    hardware: String
    colorOrder: String
    stripType: String
  }
`;

const LightStateInput = gql`
  input LightStateInput {
    name: String
    state: String
    brightness: Int
    color: ColorInput
    effect: String
    speed: Int
  }
`;

const RemovedLight = gql`
  type RemovedLight {
    id: String # uique id of accessory
    name: String # user given name of accessory
  }
`;

const Color = gql`
  type Color {
    r: Int!
    g: Int!
    b: Int!
  }
`;

const ColorInput = gql`
  input ColorInput {
    r: Int!
    g: Int!
    b: Int!
  }
`;

const DiscoveredLight = gql`
  type DiscoveredLight {
    id: String!
    configuration: LightConfig
  }
`;

const typeDefs = [
  Query,
  Mutation,
  Subscription,
  Light,
  LightState,
  LightConfig,
  LightStateInput,
  RemovedLight,
  Color,
  ColorInput,
  DiscoveredLight
];

module.exports = typeDefs;
