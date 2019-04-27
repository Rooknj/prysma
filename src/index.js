"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const config = require("./config");
const Server = require("./server");

console.log("Hello");
console.log(config);

const server = new Server();

server
  .start(config.server.port)
  .then(console.log(`Server started on port ${config.server.port}`));
