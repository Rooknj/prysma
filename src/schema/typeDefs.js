const { gql } = require("apollo-server-express");

const Query = gql`
  type Query {
    light(lightId: String!): Light
    lights: [Light]
    discoveredLights: [Light]
  }
`;

const Mutation = gql`
  type Mutation {
    setLight(lightId: String!, lightData: LightInput!): Light
    addLight(lightId: String!, lightData: LightInput): Light
    removeLight(lightId: String!): Light
    setLightState(lightId: String!, lightState: LightStateInput!): LightState
    # updateHub: String
    # rebootHub: String
  }
`;

const Subscription = gql`
  type Subscription {
    lightChanged: Light
    lightAdded: Light
    lightRemoved: Light
    lightStateChanged: LightState
  }
`;

const Light = gql`
  type Light {
    id: ID # uique id of accessory
    name: String # user given name of accessory
    supportedEffects: [String] # List of supported effects
    ipAddress: String
    macAddress: String
    numLeds: Int
    udpPort: Int
    version: String
    hardware: String
    colorOrder: String
    stripType: String
    state: LightState
  }
`;

const LightInput = gql`
  input LightInput {
    name: String
  }
`;

const LightState = gql`
  type LightState {
    id: ID
    connected: Boolean
    on: Boolean # curent power status
    brightness: Int # current brightness
    color: Color # current color
    effect: String # current effect
    speed: Int # effect speed
  }
`;

const LightStateInput = gql`
  input LightStateInput {
    name: String
    on: Boolean
    brightness: Int
    color: ColorInput
    effect: String
    speed: Int
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

const typeDefs = [
  Query,
  Mutation,
  Subscription,
  Light,
  LightInput,
  LightState,
  LightStateInput,
  Color,
  ColorInput,
];

module.exports = typeDefs;
