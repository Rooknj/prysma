const SubscriptionService = require("./SubscriptionService");
const {
  LIGHT_ADDED_EVENT,
  LIGHT_REMOVED_EVENT,
  LIGHT_CHANGED_EVENT,
  LIGHT_STATE_CHANGED_EVENT,
} = require("./serviceConstants");
const { PubSub } = require("graphql-subscriptions");
const mediator = require("./mediator");

jest.mock("graphql-subscriptions");

const mediatorOnSpy = jest.spyOn(mediator, "on");
beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  PubSub.mockClear();
  mediatorOnSpy.mockClear();
});

describe("constructor", () => {
  test("Initializes the gqlPubSub", () => {
    const subscriptionService = new SubscriptionService();

    expect(PubSub).toHaveBeenCalledTimes(1);
    expect(subscriptionService._gqlPubSub).toBeDefined();
  });
});

describe("init", () => {
  test("sets a mediator lightAdded listener", () => {
    const subscriptionService = new SubscriptionService();

    subscriptionService.init();

    expect(mediatorOnSpy).toBeCalledWith(
      LIGHT_ADDED_EVENT,
      expect.any(Function)
    );
  });
  test("sets a mediator lightRemoved listener", () => {
    const subscriptionService = new SubscriptionService();

    subscriptionService.init();

    expect(mediatorOnSpy).toBeCalledWith(
      LIGHT_REMOVED_EVENT,
      expect.any(Function)
    );
  });
  test("sets a mediator lightChanged listener", () => {
    const subscriptionService = new SubscriptionService();

    subscriptionService.init();

    expect(mediatorOnSpy).toBeCalledWith(
      LIGHT_CHANGED_EVENT,
      expect.any(Function)
    );
  });
  test("sets a mediator lightStateChanged listener", () => {
    const subscriptionService = new SubscriptionService();

    subscriptionService.init();

    expect(mediatorOnSpy).toBeCalledWith(
      LIGHT_STATE_CHANGED_EVENT,
      expect.any(Function)
    );
  });
});

describe("subscribeToChangedLights", () => {
  test("returns an async iterator", () => {
    const asyncIteratorMock = jest.fn(() => "asyncIterator");
    PubSub.mockImplementationOnce(() => ({
      asyncIterator: asyncIteratorMock,
    }));
    const subscriptionService = new SubscriptionService();

    const asyncIterator = subscriptionService.subscribeToChangedLights();

    expect(asyncIteratorMock).toBeCalledWith(LIGHT_CHANGED_EVENT);
    expect(asyncIterator).toBe("asyncIterator");
  });
});

describe("subscribeToAddedLights", () => {
  test("returns an async iterator", () => {
    const asyncIteratorMock = jest.fn(() => "asyncIterator");
    PubSub.mockImplementationOnce(() => ({
      asyncIterator: asyncIteratorMock,
    }));
    const subscriptionService = new SubscriptionService();

    const asyncIterator = subscriptionService.subscribeToAddedLights();

    expect(asyncIteratorMock).toBeCalledWith(LIGHT_ADDED_EVENT);
    expect(asyncIterator).toBe("asyncIterator");
  });
});

describe("subscribeToRemovedLights", () => {
  test("returns an async iterator", () => {
    const asyncIteratorMock = jest.fn(() => "asyncIterator");
    PubSub.mockImplementationOnce(() => ({
      asyncIterator: asyncIteratorMock,
    }));
    const subscriptionService = new SubscriptionService();

    const asyncIterator = subscriptionService.subscribeToRemovedLights();

    expect(asyncIteratorMock).toBeCalledWith(LIGHT_REMOVED_EVENT);
    expect(asyncIterator).toBe("asyncIterator");
  });
});

describe("subscribeToChangedLightStates", () => {
  test("returns an async iterator", () => {
    const asyncIteratorMock = jest.fn(() => "asyncIterator");
    PubSub.mockImplementationOnce(() => ({
      asyncIterator: asyncIteratorMock,
    }));
    const subscriptionService = new SubscriptionService();

    const asyncIterator = subscriptionService.subscribeToChangedLightStates();

    expect(asyncIteratorMock).toBeCalledWith(LIGHT_STATE_CHANGED_EVENT);
    expect(asyncIterator).toBe("asyncIterator");
  });
});

describe("_onLightChanged", () => {
  test("publishes the changed light", () => {
    const publishMock = jest.fn();
    PubSub.mockImplementationOnce(() => ({
      publish: publishMock,
    }));
    const subscriptionService = new SubscriptionService();

    subscriptionService._onLightChanged("changedLight");

    expect(publishMock).toBeCalledWith(LIGHT_CHANGED_EVENT, {
      lightChanged: "changedLight",
    });
  });
});

describe("_onLightAdded", () => {
  test("publishes the changed light", () => {
    const publishMock = jest.fn();
    PubSub.mockImplementationOnce(() => ({
      publish: publishMock,
    }));
    const subscriptionService = new SubscriptionService();

    subscriptionService._onLightAdded("addedLight");

    expect(publishMock).toBeCalledWith(LIGHT_ADDED_EVENT, {
      lightAdded: "addedLight",
    });
  });
});

describe("_onLightRemoved", () => {
  test("publishes the changed light", () => {
    const publishMock = jest.fn();
    PubSub.mockImplementationOnce(() => ({
      publish: publishMock,
    }));
    const subscriptionService = new SubscriptionService();

    subscriptionService._onLightRemoved("removedLight");

    expect(publishMock).toBeCalledWith(LIGHT_REMOVED_EVENT, {
      lightRemoved: "removedLight",
    });
  });
});

describe("_onLightStateChanged", () => {
  test("publishes the changed light", () => {
    const publishMock = jest.fn();
    PubSub.mockImplementationOnce(() => ({
      publish: publishMock,
    }));
    const subscriptionService = new SubscriptionService();

    subscriptionService._onLightStateChanged("changedLightState");

    expect(publishMock).toBeCalledWith(LIGHT_STATE_CHANGED_EVENT, {
      lightStateChanged: "changedLightState",
    });
  });
});
