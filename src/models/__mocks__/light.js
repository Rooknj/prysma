const SequelizeMock = require("sequelize-mock");
const DBConnectionMock = new SequelizeMock();
//const LightModel = require("../light");

module.exports = jest.fn(() => {
  const LightModelMock = DBConnectionMock.define("light", {
    id: "Prysma-AABBCCDDEEFF",
    name: "Mock Light",
    supportedEffects: "test 1,test 2, test 3", // TEXT is unlimited length string
    ipAddress: "10.0.0.1",
    macAddress: "AA:BB:CC:DD:EE:FF",
    numLeds: 60,
    udpPort: 7778,
    version: "0.0.0",
    hardware: "8266",
    colorOrder: "GRB",
    stripType: "WS2812B",
    rank: 1
  });
  LightModelMock.findByPk = jest.fn(id => {
    let lightModel = LightModelMock.findById(id);
    lightModel.get = jest.fn(options => lightModel.get(options));
    return lightModel;
  });
  return LightModelMock;
});
