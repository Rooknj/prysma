const EventEmitter = require("events");

class MockMqtt extends EventEmitter {
  constructor(host, options) {
    super();
    this.host = host;
    this.options = options;
    this.end = jest.fn();
  }
}

module.exports = {
  connect: (host, options) => new MockMqtt(host, options)
};
