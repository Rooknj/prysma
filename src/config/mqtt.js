module.exports = {
  host: `tcp://${process.env.MQTT_HOST}:1883` || "tcp://localhost:1883",
  options: {
    reconnectPeriod: 5000, // Amount of time between reconnection attempts
    username: "pi",
    password: "MQTTIsBetterThanUDP"
  },
  topics: {
    top: "prysmalight",
    connected: "connected",
    state: "state",
    command: "command",
    effectList: "effects",
    config: "config",
    discovery: "discovery",
    discoveryResponse: "hello"
  }
};
