const { getDb } = require("../../../clients/db");
const { toLightObject, toLightModel } = require("../../../lib/lightUtil");
const { ValidationError } = require("../../../lib/errors");
// const Debug = require("debug").default;

// const debug = Debug("LightDao");

class LightDao {
  constructor() {
    this._db = getDb();
  }

  async getLights() {
    let lights;
    try {
      lights = await this._db.findAll();
    } catch (error) {
      throw error;
    }
    return lights.map(light => toLightObject(light.get({ plain: true })));
  }

  async getLight(lightId) {
    if (!lightId) throw new Error("No ID provided");
    let light;
    try {
      light = await this._db.findByPk(lightId);
    } catch (error) {
      throw error;
    }
    if (!light) throw new Error(`"${lightId}" not found`);
    return toLightObject(light.get({ plain: true }));
  }

  async setLight(lightId, lightData) {
    if (!lightId) throw new Error("No ID provided");
    if (!lightData) throw new Error("No Data provided");

    let lightToChange;
    try {
      lightToChange = await this._db.findByPk(lightId);
    } catch (error) {
      throw error;
    }
    if (!lightToChange) throw new Error(`"${lightId}" not found`);

    try {
      await lightToChange.update(toLightModel(lightData));
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        throw new ValidationError(error);
      } else {
        // TODO: figure out what other errors can be thrown
        throw error;
      }
      // TODO: Handle what happens if findOne errors vs if .destroy() fails
    }
  }

  async addLight(lightId, lightName) {
    if (!lightId) throw new Error("No ID provided");
    let addedLight;
    try {
      addedLight = await this._db.create({
        id: lightId,
        name: lightName || lightId,
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        throw new ValidationError(error);
      } else {
        // TODO: figure out what other errors can be thrown
        throw error;
      }
    }
    return toLightObject(addedLight.get({ plain: true }));
  }

  async removeLight(lightId) {
    if (!lightId) throw new Error("No ID provided");
    let removedLight;
    try {
      const lightToRemove = await this._db.findByPk(lightId);
      if (!lightToRemove) throw new Error(`"${lightId}" not found`);
      removedLight = { id: lightToRemove.id, name: lightToRemove.name };
      await lightToRemove.destroy();
    } catch (error) {
      throw error;
      // TODO: Handle what happens if findOne errors vs if .destroy() fails
    }
    return removedLight;
  }
}

module.exports = LightDao;
