const Sequelize = require("sequelize");
const Debug = require("debug").default;
const LightModel = require("./models/LightModel");

const debug = Debug("Client:Db");

let _db;
const _models = {};

const initDb = async options => {
  if (_db) {
    throw new Error("Trying to init DB again!");
  }

  _db = new Sequelize({ ...options, logging: false });

  try {
    debug(`Connecting to Sequelize...`);
    await _db.authenticate();
    debug("Connected to Sequelize");
    _models.lightModel = LightModel(_db, Sequelize);
    await _db.sync();
    debug(`Database & tables created!`);
  } catch (error) {
    // TODO: Handle what happens if authenticate fails vs if sync fails
    // Note: We are throwing the errors here because the caller will need to handle them
    throw error;
  }
  debug("DB initialization complete");
};

const getDb = () => {
  if (!_db || !_models.lightModel)
    throw new Error("Db has not been initialized. Please call init first.");
  return _models.lightModel;
};

const closeDb = () => {
  if (_db) {
    debug(`Closing connection to db`);
    return _db.close();
  }
  debug(`Db has not been initialized.`);
  return null;
};

module.exports = {
  initDb,
  getDb,
  closeDb,
};
