const PrysmaMqtt = require("./prysmaMqtt");
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
    unsubscribe: jest.fn(async topic => {})
  };
};

describe("subscribeToLight", () => {
  test("Subscribes to all the correct topics (Example 1)", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await prysmaMqtt.subscribeToLight(ID);

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
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test 123";

    // Call The Method
    const error = await prysmaMqtt.subscribeToLight(ID);

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
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = false;

    const ID = "Test A";

    // Call The Method
    const error = await prysmaMqtt.subscribeToLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to subscribe to at least one topic", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    mockClient.subscribe = jest.fn(async () => {
      throw new Error();
    });
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await prysmaMqtt.subscribeToLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.subscribe).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    // Call The Method
    const error = await prysmaMqtt.subscribeToLight();

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});

describe("publishToLight", () => {
  test("Publishes the message to the correct topic as a buffer (Example 1)", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";
    const MESSAGE = { brightness: 40 };

    // Call The Method
    const error = await prysmaMqtt.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeNull();
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.command}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("Publishes the message to the correct topic as a buffer (Example 2)", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await prysmaMqtt.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeNull();
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${TOPICS.top}/${ID}/${TOPICS.command}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("returns an error if the client is not connected", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = false;

    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await prysmaMqtt.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if the client fails to publish", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    mockClient.publish = jest.fn(() => {
      throw new Error();
    });
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await prysmaMqtt.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.publish).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = null;
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await prysmaMqtt.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no message was provided", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";
    const MESSAGE = null;

    // Call The Method
    const error = await prysmaMqtt.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});

describe("unsubscribeFromLight", () => {
  test("Unsubscribes from all the correct topics (Example 1)", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await prysmaMqtt.unsubscribeFromLight(ID);

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
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test 123";

    // Call The Method
    const error = await prysmaMqtt.unsubscribeFromLight(ID);

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
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = false;

    const ID = "Test A";

    // Call The Method
    const error = await prysmaMqtt.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeNull();
  });
  test("returns an error if it fails to unsubscribe from at least one topic", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    mockClient.unsubscribe = jest.fn(async () => {
      throw new Error();
    });
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    const ID = "Test A";

    // Call The Method
    const error = await prysmaMqtt.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.unsubscribe).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and prysmaMqtt
    let mockClient = createMockClient();
    let prysmaMqtt = new PrysmaMqtt(TOPICS);
    prysmaMqtt._client = mockClient;
    prysmaMqtt.connected = true;

    // Call The Method
    const error = await prysmaMqtt.unsubscribeFromLight();

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});
