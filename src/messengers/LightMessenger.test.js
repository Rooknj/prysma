const LightMessenger = require("./LightMessenger");
const { ValidationError } = require("../errors");

jest.mock("../clients/mqtt", () => {
  const getMqtt = jest.fn(() =>
    Object.create({
      on: jest.fn(),
      subscribe: jest.fn(async topic => [{ topic, qos: 0 }]),
      publish: jest.fn(async (topic, payload) => {}),
      unsubscribe: jest.fn(async topic => {}),
      end: jest.fn(),
      connected: true,
    })
  );

  return { getMqtt };
});

const TOPICS = {
  top: "prysmalight",
  connected: "connected",
  state: "state",
  command: "command",
  effectList: "effects",
  config: "config",
  discovery: "discovery",
  discoveryResponse: "hello",
};

const createMockClient = () => ({
  on: () => {},
  subscribe: jest.fn(async topic => [{ topic, qos: 0 }]),
  publish: jest.fn(async (topic, payload) => {}),
  unsubscribe: jest.fn(async topic => {}),
  end: jest.fn(),
});

describe("constructor", () => {
  test("properly initializes everything", () => {
    const lightMessenger = new LightMessenger(TOPICS);

    expect(lightMessenger.connected).toBe(true);
    expect(lightMessenger._topics).toBe(TOPICS);
  });

  test("starts listening for connect events", () => {
    const lightMessenger = new LightMessenger(TOPICS);

    expect(lightMessenger._client.on).toBeCalledWith("connect", expect.any(Function));
  });
  test("starts listening for offline events", () => {
    const lightMessenger = new LightMessenger(TOPICS);

    expect(lightMessenger._client.on).toBeCalledWith("offline", expect.any(Function));
  });
  test("starts listening for messange events", () => {
    const lightMessenger = new LightMessenger(TOPICS);

    expect(lightMessenger._client.on).toBeCalledWith("message", expect.any(Function));
  });
});

describe("subscribeToLight", () => {
  test("Subscribes to all the correct topics (Example 1)", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";

    // Call The Method
    await lightMessenger.subscribeToLight(ID);

    // Test
    expect(mockClient.subscribe).toBeCalledTimes(4);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.connected}`);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.state}`);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.effectList}`);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.config}`);
  });
  test("Subscribes to all the correct topics (Example 2)", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test 123";

    // Call The Method
    await lightMessenger.subscribeToLight(ID);

    // Test
    expect(mockClient.subscribe).toBeCalledTimes(4);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.connected}`);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.state}`);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.effectList}`);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.config}`);
  });
  test("rejects if the client is not connected", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = false;

    const ID = "Test A";

    const messengerPromise = lightMessenger.subscribeToLight(ID);

    await expect(messengerPromise).rejects.toThrow(Error);
  });
  test("rejects if it fails to subscribe to at least one topic", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    mockClient.subscribe = jest.fn(async () => {
      throw new Error();
    });
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";

    // Call The Method
    const messengerPromise = lightMessenger.subscribeToLight(ID);

    await expect(messengerPromise).rejects.toThrow(Error);
    expect(mockClient.subscribe).toBeCalled();
  });
  test("rejects if no id was provided", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    // Call The Method
    const messengerPromise = lightMessenger.subscribeToLight();

    await expect(messengerPromise).rejects.toThrow(Error);
  });
});

describe("publishToLight", () => {
  test("Publishes the message to the correct topic as a buffer (Example 1)", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";
    const MESSAGE = { mutationId: 9, name: ID, brightness: 40 };

    // Call The Method
    await lightMessenger.publishToLight(ID, MESSAGE);

    // Test
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.command}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("Publishes the message to the correct topic as a buffer (Example 2)", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";
    const MESSAGE = { mutationId: 9, name: ID, effect: "Cylon" };

    // Call The Method
    await lightMessenger.publishToLight(ID, MESSAGE);

    // Test
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.command}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("rejects if the client is not connected", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = false;

    const ID = "Test A";
    const MESSAGE = { mutationId: 9, name: ID, effect: "Cylon" };

    // Call The Method
    const messengerPromise = lightMessenger.publishToLight(ID, MESSAGE);

    await expect(messengerPromise).rejects.toThrow(Error);
  });
  test("rejects if the client fails to publish", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    mockClient.publish = jest.fn(() => {
      throw new Error();
    });
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";
    const MESSAGE = { mutationId: 9, name: ID, effect: "Cylon" };

    // Call The Method
    const messengerPromise = lightMessenger.publishToLight(ID, MESSAGE);

    // Test
    await expect(messengerPromise).rejects.toThrow(Error);
    expect(mockClient.publish).toBeCalled();
  });
  test("rejects if no id was provided", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = null;
    const MESSAGE = { mutationId: 9, name: ID, effect: "Cylon" };

    // Call The Method
    const messengerPromise = lightMessenger.publishToLight(ID, MESSAGE);

    // Test
    await expect(messengerPromise).rejects.toThrow(Error);
  });
  test("rejects if no message was provided", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";

    // Call The Method
    const messengerPromise = lightMessenger.publishToLight(ID);

    // Test
    await expect(messengerPromise).rejects.toThrow(Error);
  });
  test("rejects if the message fails verification", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";
    const MESSAGE = { mutationId: 9, name: ID, effect: 123456 };

    // Call The Method
    const messengerPromise = lightMessenger.publishToLight(ID, MESSAGE);

    // Test
    await expect(messengerPromise).rejects.toThrow(ValidationError);
  });
});

describe("unsubscribeFromLight", () => {
  test("Unsubscribes from all the correct topics (Example 1)", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";

    // Call The Method
    await lightMessenger.unsubscribeFromLight(ID);

    // Test
    expect(mockClient.unsubscribe).toBeCalledTimes(4);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.connected}`);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.state}`);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.effectList}`);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.config}`);
  });
  test("Unsubscribes from all the correct topics (Example 2)", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test 123";

    // Call The Method
    await lightMessenger.unsubscribeFromLight(ID);

    // Test
    expect(mockClient.unsubscribe).toBeCalledTimes(4);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.connected}`);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.state}`);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.effectList}`);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/${ID}/${TOPICS.config}`);
  });
  test("does not reject if the client is not connected", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = false;

    const ID = "Test A";

    // Call The Method
    await lightMessenger.unsubscribeFromLight(ID);
  });
  test("rejects if it fails to unsubscribe from at least one topic", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    mockClient.unsubscribe = jest.fn(async () => {
      throw new Error();
    });
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    const ID = "Test A";

    // Call The Method
    const messengerPromise = lightMessenger.unsubscribeFromLight(ID);

    // Test
    await expect(messengerPromise).rejects.toThrow(Error);
    expect(mockClient.unsubscribe).toBeCalled();
  });
  test("rejects if no id was provided", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    // Call The Method
    const messengerPromise = lightMessenger.unsubscribeFromLight();

    // Test
    await expect(messengerPromise).rejects.toThrow(Error);
  });
});

describe("_handleConnect", () => {
  test("sets connected to true", () => {
    const lightMessenger = new LightMessenger(TOPICS);

    lightMessenger._handleConnect();

    expect(lightMessenger.connected).toBe(true);
  });

  test("emits connect", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const DATA = {
      data: "123",
    };
    lightMessenger._handleConnect(DATA);

    expect(lightMessenger.emit).toBeCalledWith("connect", DATA);
  });
});

describe("_handleDisconnect", () => {
  test("sets connected to false", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.connected = true;

    lightMessenger._handleDisconnect();

    expect(lightMessenger.connected).toBe(false);
  });

  test("emits disconnect event", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const DATA = {
      data: "123",
    };
    lightMessenger._handleDisconnect(DATA);

    expect(lightMessenger.emit).toBeCalledWith("disconnect", DATA);
  });
});

describe("_handleMessage", () => {
  test("emits connectedMessage on a connected message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.connected}`;
    const data = { name: "Prysma-807D3A41B465", connection: 2 };
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).toBeCalledWith("connectedMessage", data);
  });

  test("emits stateMessage on a state message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.state}`;
    const data = {
      name: "Prysma-807D3A41B465",
      state: "OFF",
      color: { r: 255, g: 0, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4,
    };
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).toBeCalledWith("stateMessage", data);
  });

  test("emits effectListMessage on an effect list message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

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
        "Noise",
      ],
    };
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).toBeCalledWith("effectListMessage", data);
  });

  test("emits configMessage on a config message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

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
      udpPort: 7778,
    };
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).toBeCalledWith("configMessage", data);
  });

  test("emits discoveryMessage on a discovery message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

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
      udpPort: 7778,
    };
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).toBeCalledWith("discoveryMessage", data);
  });

  test("does not emit anything on a bad connected message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.connected}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad state message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.state}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad effect list message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.effectList}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad config message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.config}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });

  test("does not emit anything on a bad discovery message", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/${TOPICS.discoveryResponse}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });

  test("does not emit anything on an unrelated top level topic", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `unrelated/test/${TOPICS.state}`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });

  test("does not emit anything on an unrelated bottom level topic", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test/unrelated`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });

  test("does not emit anything on a too short topic", () => {
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger.emit = jest.fn();

    const topic = `${TOPICS.top}/test`;
    const data = {};
    const message = Buffer.from(JSON.stringify(data));
    lightMessenger._handleMessage(topic, message);

    expect(lightMessenger.emit).not.toBeCalled();
  });
});

describe("startDiscovery", () => {
  test("subscribes to the discovery response topic", async () => {
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    // Call The Method
    await lightMessenger.startDiscovery();

    // Test
    expect(mockClient.subscribe).toBeCalledTimes(1);
    expect(mockClient.subscribe).toBeCalledWith(`${TOPICS.top}/+/${TOPICS.discoveryResponse}`);
  });
});

describe("stopDiscovery", () => {
  test("unsubscribes from the discovery response topic", async () => {
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    // Call The Method
    await lightMessenger.stopDiscovery();

    // Test
    expect(mockClient.unsubscribe).toBeCalledTimes(1);
    expect(mockClient.unsubscribe).toBeCalledWith(`${TOPICS.top}/+/${TOPICS.discoveryResponse}`);
  });
});

describe("publishDiscovery", () => {
  test("publishes to the discovery topic", async () => {
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = true;

    // Call The Method
    await lightMessenger.publishDiscovery();

    // Test
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(`${TOPICS.top}/${TOPICS.discovery}`, "ping");
  });
  test("rejects if the client is not connected", async () => {
    // Create the client and lightMessenger
    const mockClient = createMockClient();
    const lightMessenger = new LightMessenger(TOPICS);
    lightMessenger._client = mockClient;
    lightMessenger.connected = false;

    // Call The Method
    const messengerPromise = lightMessenger.publishDiscovery();

    await expect(messengerPromise).rejects.toThrow(Error);
  });
});
