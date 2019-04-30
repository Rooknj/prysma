const EventEmitter = require("events");
const Sequelize = require("sequelize");

class PrysmaDb extends EventEmitter {
  constructor() {
    super();
    this.sequelize = null;
  }

  connect(options) {
    this.sequelize = new Sequelize(options);
    this.sequelize
      .authenticate()
      .then(() => {
        console.log("Connection has been established successfully.");
      })
      .catch(err => {
        console.error("Unable to connect to the database:", err);
      });
  }
}

module.exports = PrysmaDb;
