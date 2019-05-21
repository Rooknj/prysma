// http://docs.sequelizejs.com/variable/index.html#static-variable-DataTypes
// TODO: Check out validations: http://docs.sequelizejs.com/manual/models-definition.html#validations
module.exports = (sequelize, type) => {
  return sequelize.define("light", {
    id: {
      type: type.STRING,
      primaryKey: true
    },
    name: type.STRING,
    supportedEffects: {
      type: type.TEXT,
      validate: { is: ["^$|^[\\w ]+\\w(,[\\w ]+\\w)*$"] },
      allowNull: false,
      defaultValue: ""
    }, // TEXT is unlimited length string
    ipAddress: {
      type: type.STRING,
      validate: {
        isIPv4: true
      }
    },
    macAddress: {
      type: type.STRING,
      validate: {
        is: ["^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$"]
      }
    },
    numLeds: { type: type.INTEGER },
    udpPort: type.INTEGER,
    version: type.STRING,
    hardware: type.STRING,
    colorOrder: type.STRING,
    stripType: type.STRING,
    rank: type.INTEGER
  });
};
