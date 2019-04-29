module.exports = {
  host: `tcp://${process.env.MQTT_HOST}:1883` || "tcp://localhost:1883",
  options: {
    reconnectPeriod: 5000, // Amount of time between reconnection attempts
    username: "pi",
    password: "MQTTIsBetterThanUDP"
  },
  topics: {
    MQTT_LIGHT_TOP_LEVEL: "prysmalight",
    MQTT_LIGHT_CONNECTED_TOPIC: "connected",
    MQTT_LIGHT_STATE_TOPIC: "state",
    MQTT_LIGHT_COMMAND_TOPIC: "command",
    MQTT_EFFECT_LIST_TOPIC: "effects",
    MQTT_LIGHT_CONFIG_TOPIC: "config",
    MQTT_LIGHT_DISCOVERY_TOPIC: "discovery",
    MQTT_LIGHT_DISCOVERY_RESPONSE_TOPIC: "hello"
  }
};
