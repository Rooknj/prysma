const faker = require("faker");

const getFakeId = () =>
  `Prysma-${faker.internet
    .mac()
    .replace(/:/g, "")
    .toUpperCase()}`;

module.exports = {
  Light: () => ({
    id: getFakeId(),
    name: faker.lorem.word(),
    supportedEffects: ["Random 1", "Random 2"]
  }),
  LightState: () => ({
    connected: true,
    state: "OFF",
    brightness: 100,
    effect: "Random",
    speed: 3
  }),
  LightConfig: () => ({
    ipAddress: faker.internet.ip(),
    macAddress: faker.internet.mac(),
    numLeds: faker.random.number({ min: 1, max: 500 }),
    udpPort: 7778,
    version: "0.0.0",
    hardware: "8266",
    colorOrder: "GRB",
    stripType: "WS2812B"
  }),
  Color: () => ({
    r: faker.random.number({ min: 0, max: 255 }),
    g: faker.random.number({ min: 0, max: 255 }),
    b: faker.random.number({ min: 0, max: 255 })
  }),
  DiscoveredLight: () => ({
    id: getFakeId()
  })
};
