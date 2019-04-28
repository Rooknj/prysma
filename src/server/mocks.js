module.exports = {
  Light: () => ({
    id: "Hello",
    name: "Hello",
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
    ipAddress: "10.0.0.4",
    macAddress: "aa-bb-cc-dd-ee-ff",
    numLeds: 150,
    udpPort: 7778,
    version: "0.0.0",
    hardware: "8266",
    colorOrder: "GRB",
    stripType: "WS2812B"
  }),
  Color: () => ({
    r: 255,
    g: 125,
    b: 0
  }),
  DiscoveredLight: () => ({
    id: "Discovery"
  })
};
