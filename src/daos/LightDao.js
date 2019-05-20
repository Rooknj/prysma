const EventEmitter = require("events");
const Sequelize = require("sequelize");
const LightModel = require("../models/LightModel");
const { toLightObject } = require("../utils/lightUtils");
const Debug = require("debug").default;

const debug = Debug("LightDao");

class LightDao extends EventEmitter {
  constructor() {
    super();
    this._sequelize = null;
    this._models = {};
  }

  async connect(options) {
    //console.log(Sequelize)
    this._sequelize = new Sequelize({ ...options, logging: false });
    try {
      debug(`Connecting to Sequelize...`);
      await this._sequelize.authenticate();
      debug("Connected to Sequelize");
      this._models.Light = LightModel(this._sequelize, Sequelize);
      await this._sequelize.sync();
      debug(`Database & tables created!`);
    } catch (error) {
      // TODO: Handle what happens if authenticate fails vs if sync fails
      // Note: We are throwing the errors here because the caller will need to handle them
      throw error;
    }
  }

  async getLights() {
    let lights;
    try {
      lights = await this._models.Light.findAll();
    } catch (error) {
      throw error;
    }
    return lights.map(toLightObject);
  }

  async getLight(lightId) {
    if (!lightId) throw new Error("No ID provided");
    let light;
    try {
      light = await this._models.Light.findByPk(lightId);
    } catch (error) {
      throw error;
    }
    if (!light) throw new Error(`"${lightId}" not found`);
    return toLightObject(light);
  }

  async setLight(lightId, lightData) {
    if (!lightId) throw new Error("No ID provided");
    if (!lightData) throw new Error("No Data provided");
    try {
      const lightToChange = await this._models.Light.findByPk(lightId);
      if (!lightToChange) throw new Error(`"${lightId}" not found`);
      await lightToChange.update(lightData);
    } catch (error) {
      // TODO: Handle what happens if findOne errors vs if .destroy() fails
      throw error;
    }
  }

  async addLight(lightId, lightName) {
    if (!lightId) throw new Error("No ID provided");
    let addedLight;
    try {
      addedLight = await this._models.Light.create({
        id: lightId,
        name: lightName || lightId
      });
    } catch (error) {
      throw error;
    }
    return toLightObject(addedLight);
  }

  async removeLight(lightId) {
    if (!lightId) throw new Error("No ID provided");
    let removedLight;
    try {
      const lightToRemove = await this._models.Light.findByPk(lightId);
      if (!lightToRemove) throw new Error(`"${lightId}" not found`);
      removedLight = { id: lightToRemove.id, name: lightToRemove.name };
      await lightToRemove.destroy();
    } catch (error) {
      // TODO: Handle what happens if findOne errors vs if .destroy() fails
      throw error;
    }
    return removedLight;
  }
}

module.exports = LightDao;
