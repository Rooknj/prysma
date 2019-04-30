const EventEmitter = require("events");
const Sequelize = require("sequelize");
const LightModel = require("../models/light");
const Debug = require("debug").default;

const debug = Debug("db");

class PrysmaDb extends EventEmitter {
  constructor() {
    super();
    this._sequelize = null;
    this._models = {};
  }

  async connect(options) {
    this._sequelize = new Sequelize({ ...options, logging: false });
    try {
      await this._sequelize.authenticate();
      debug("Connection has been established successfully.");
      this._models.Light = LightModel(this._sequelize, Sequelize);
      await this._sequelize.sync();
      debug(`Database & tables created!`);
    } catch (error) {
      // TODO: Handle what happens if authenticate fails vs if sync fails
      throw error;
    }
  }

  async getLights() {
    let lights = null;
    try {
      lights = await this._models.Light.findAll();
    } catch (error) {
      throw error;
    }
    return lights;
  }

  async getLight(lightId) {
    let light = null;
    try {
      light = await this._models.Light.findOne({ where: { id: lightId } });
    } catch (error) {
      throw error;
    }
    return light;
  }

  async addLight(lightId, lightName) {
    let addedLight = null;
    try {
      addedLight = await this._models.Light.create({
        id: lightId,
        name: lightName || lightId
      });
    } catch (error) {
      throw error;
    }
    return addedLight;
  }

  async removeLight(lightId) {
    let removedLight = null;
    try {
      const lightToRemove = await this._models.Light.findOne({
        where: { id: lightId }
      });
      await lightToRemove.destroy();
      removedLight = lightId;
    } catch (error) {
      // TODO: Handle what happens if findOne errors vs if .destroy() fails
      throw error;
    }
    return removedLight;
  }
}

module.exports = PrysmaDb;
