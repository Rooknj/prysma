const packageJson = require("../../package.json");

const full = (req, res) => res.status(200).send("Health Check Ok");
const version = (req, res) =>
  res
    .status(200)
    .json({
      version: packageJson.version,
      currentTime: new Date(),
      env: process.env.APP_ENV,
      nodeEnv: process.env.NODE_ENV,
    });

module.exports = {
  full,
  version,
};
