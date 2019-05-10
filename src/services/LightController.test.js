const LightController = require("./LightController");

const TOPICS = {
  top: "prysmalight",
  connected: "connected",
  state: "state",
  command: "command",
  effectList: "effects",
  config: "config",
  discovery: "discovery",
  discoveryResponse: "hello"
};

const createMockClient = () => {
  return {
    on: () => {},
    subscribe: jest.fn(async topic => [{ topic, qos: 0 }]),
    publish: jest.fn(async (topic, payload) => {}),
    unsubscribe: jest.fn(async topic => {}),
    end: jest.fn()
  };
};

describe("constructor", () => {
  test("properly initializes everything", () => {
    let lightController = new LightController(TOPICS);

    expect(lightController.connected).toBe(false);
    expect(lightController._topics).toBe(TOPICS);
    expect(lightController._host).toBe(null);
    expect(lightController._client).toBe(null);
  });
});

describe("connect", () => {
  test("calls mqtt with the provided arguments", () => {
    let lightController = new LightController(TOPICS);

    const HOST =
      `tcp://${process.env.MQTT_HOST}:1883` || "tcp://localhost:1883";
    const OPTIONS = {
      reconnectPeriod: 5000, // Amount of time between reconnection attempts
      username: "pi",
      password: "MQTTIsBetterThanUDP"
    };
    lightController.connect(HOST, OPTIONS);
    expect(lightController._client.host).toBe(HOST);
    expect(lightController._client.options).toEqual(OPTIONS);
  });

  test("assigns the appropriate listeners to the client", () => {
    let lightController = new LightController(TOPICS);

    const HOST =
      `tcp://${process.env.MQTT_HOST}:1883` || "tcp://localhost:1883";
    const OPTIONS = {
      reconnectPeriod: 5000, // Amount of time between reconnection attempts
      username: "pi",
      password: "MQTTIsBetterThanUDP"
    };
    lightController.connect(HOST, OPTIONS);
    expect(lightController._client._events.connect).toBeDefined();
    expect(lightController._client._events.close).toBeDefined();
    expect(lightController._client._events.message).toBeDefined();
  });
});

describe("end", () => {
  test("calls _client.end()", () => {
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;

    lightController.end();

    expect(mockClient.end).toBeCalledTimes(1);
  });
});

describe("subscribeToLight", () => {
  test("Subscribes to all the correct topics (Example 1)", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await lightController.subscribeToLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.subscribe).toBeCalledTimes(4);
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.connected}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.state}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.effectList}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.config}`
    );
  });
  test("Subscribes to all the correct topics (Example 2)", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test 123";

    // Call The Method
    const error = await lightController.subscribeToLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.subscribe).toBeCalledTimes(4);
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.connected}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.state}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.effectList}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.config}`
    );
  });
  test("returns an error if the client is not connected", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = false;

    const ID = "Test A";

    // Call The Method
    const error = await lightController.subscribeToLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to subscribe to at least one topic", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    mockClient.subscribe = jest.fn(async () => {
      throw new Error();
    });
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await lightController.subscribeToLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.subscribe).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    // Call The Method
    const error = await lightController.subscribeToLight();

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});

describe("publishToLight", () => {
  test("Publishes the message to the correct topic as a buffer (Example 1)", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";
    const MESSAGE = { brightness: 40 };

    // Call The Method
    const error = await lightController.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeNull();
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.command}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("Publishes the message to the correct topic as a buffer (Example 2)", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await lightController.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeNull();
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.command}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("returns an error if the client is not connected", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = false;

    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await lightController.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if the client fails to publish", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    mockClient.publish = jest.fn(() => {
      throw new Error();
    });
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await lightController.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.publish).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = null;
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await lightController.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no message was provided", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";
    const MESSAGE = null;

    // Call The Method
    const error = await lightController.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});

describe("unsubscribeFromLight", () => {
  test("Unsubscribes from all the correct topics (Example 1)", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await lightController.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.unsubscribe).toBeCalledTimes(4);
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.connected}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.state}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.effectList}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.config}`
    );
  });
  test("Unsubscribes from all the correct topics (Example 2)", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test 123";

    // Call The Method
    const error = await lightController.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.unsubscribe).toBeCalledTimes(4);
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.connected}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.state}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.effectList}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.config}`
    );
  });
  test("returns an null if the client is not connected", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = false;

    const ID = "Test A";

    // Call The Method
    const error = await lightController.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeNull();
  });
  test("returns an error if it fails to unsubscribe from at least one topic", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    mockClient.unsubscribe = jest.fn(async () => {
      throw new Error();
    });
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await lightController.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.unsubscribe).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and lightController
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    // Call The Method
    const error = await lightController.unsubscribeFromLight();

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});

describe("_handleConnect", () => {
  test("sets connected to true", () => {
    let lightController = new LightController(TOPICS);

    lightController._handleConnect();

    expect(lightController.connected).toBe(true);
  });

  test("emits connect", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const DATA = {
      data: "123"
    };
    lightController._handleConnect(DATA);

    expect(lightController.__proto__.emit).toBeCalledWith("connect", DATA);
  });
});

describe("_handleDisconnect", () => {
  test("sets connected to false", () => {
    let lightController = new LightController(TOPICS);
    lightController.connected = true;

    lightController._handleDisconnect();

    expect(lightController.connected).toBe(false);
  });

  test("emits close", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const DATA = {
      data: "123"
    };
    lightController._handleDisconnect(DATA);

    expect(lightController.__proto__.emit).toBeCalledWith("close", DATA);
  });
});

describe("_handleMessage", () => {
  test("emits connectedMessage on a connected message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.connected}`;
    const data = { name: "Prysma-807D3A41B465", connection: 2 };
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).toBeCalledWith(
      "connectedMessage",
      data
    );
  });

  test("emits stateMessage on a state message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.state}`;
    const data = {
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).toBeCalledWith("stateMessage", data);
  });

  test("emits effectListMessage on an effect list message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.effectList}`;
    const data = {
      name: "Prysma-807D3A41B465",
      effectList: [
        "Flash",
        "Fade",
        "Rainbow",
        "Cylon",
        "Sinelon",
        "Confetti",
        "BPM",
        "Juggle",
        "Visualize",
        "Dots",
        "Fire",
        "Lightning",
        "Noise"
      ]
    };
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).toBeCalledWith(
      "effectListMessage",
      data
    );
  });

  test("emits configMessage on a config message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.config}`;
    const data = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).toBeCalledWith(
      "configMessage",
      data
    );
  });

  test("emits discoveryMessage on a discovery message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.discoveryResponse}`;
    const data = {
      id: "Prysma-807D3A41B465",
      name: "Prysma-807D3A41B465",
      version: "1.0.0",
      hardware: "8266",
      colorOrder: "GRB",
      stripType: "WS2812B",
      ipAddress: "10.0.2.8",
      macAddress: "80:7D:3A:41:B4:65",
      numLeds: 120,
      udpPort: 7778
    };
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).toBeCalledWith(
      "discoveryMessage",
      data
    );
  });

  test("does not emit anything on a bad connected message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.connected}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad state message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.state}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad effect list message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.effectList}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad config message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.config}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad discovery message", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.discoveryResponse}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });

  test("does not emit anything on an unrelated top level topic", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `unrelated/test/${TOPICS.state}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });

  test("does not emit anything on an unrelated bottom level topic", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test/unrelated`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });

  test("does not emit anything on a too short topic", () => {
    let lightController = new LightController(TOPICS);
    lightController.__proto__.emit = jest.fn();

    const topic = `${TOPICS.top}/test`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightController._handleMessage(topic, message);

    expect(lightController.__proto__.emit).not.toBeCalled();
  });
});

describe("startDiscovery", () => {
  test("subscribes to the discovery response topic", async () => {
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    // Call The Method
    const error = await lightController.startDiscovery();

    // Test
    expect(error).toBeNull();
    expect(mockClient.subscribe).toBeCalledTimes(1);
    expect(mockClient.subscribe).toBeCalledWith(
      `${TOPICS.top}/+/${TOPICS.discoveryResponse}`
    );
  });
});

describe("stopDiscovery", () => {
  test("unsubscribes from the discovery response topic", async () => {
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    // Call The Method
    const error = await lightController.stopDiscovery();

    // Test
    expect(error).toBeNull();
    expect(mockClient.unsubscribe).toBeCalledTimes(1);
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${TOPICS.top}/+/${TOPICS.discoveryResponse}`
    );
  });
});

describe("publishDiscovery", () => {
  test("publishes to the discovery topic", async () => {
    let mockClient = createMockClient();
    let lightController = new LightController(TOPICS);
    lightController._client = mockClient;
    lightController.connected = true;

    // Call The Method
    const error = await lightController.publishDiscovery();

    // Test
    expect(error).toBeNull();
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${TOPICS.top}/${TOPICS.discovery}`,
      "ping"
    );
  });
});
