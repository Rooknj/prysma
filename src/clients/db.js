"use strict";

const Sequelize = require("sequelize");
const LightModel = require("./models/LightModel");
const Debug = require("debug").default;

const debug = Debug("Client:Db");

let _db;

const initDb = async options => {
  if (_db) {
    throw new Error("Trying to init DB again!");
  }

  const sequelize = new Sequelize({ ...options, logging: false });

  try {
    debug(`Connecting to Sequelize...`);
    await sequelize.authenticate();
    debug("Connected to Sequelize");
    _db = LightModel(sequelize, Sequelize);
    await sequelize.sync();
    debug(`Database & tables created!`);
  } catch (error) {
    // TODO: Handle what happens if authenticate fails vs if sync fails
    // Note: We are throwing the errors here because the caller will need to handle them
    throw error;
  }
  debug("DB initialization complete");
};

const getDb = () => {
  if (!_db)
    throw new Error("Db has not been initialized. Please call init first.");
  return _db;
};

module.exports = {
  initDb,
  getDb
};
