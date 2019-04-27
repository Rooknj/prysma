const express = require("express");

class Server {
  constructor() {
    this.app = express();
    this.app.get("/", (req, res) => res.send("Hello World!"));
  }

  start(port) {
    return new Promise(resolve => {
      this.app.listen(port, resolve);
    });
  }
}

module.exports = Server;
