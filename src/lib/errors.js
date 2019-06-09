class ValidationError extends Error {
  constructor(error) {
    super(error.message);
    this.name = "ValidationError";
    this.message = error.message;
    this.stack = error.stack;
    if (error.name === "SequelizeValidationError") {
      // Validations are automatically run on create, update and save
      this.type = "Sequelize";
      // error.errors is an array of all validation errors
    } else if (error.name === "ValidationError") {
      this.type = "Joi";
      // error._object is what was passed in
      // error.details is more details on the error
    }
  }
}

// TODO: Add InputError

module.exports = {
  ValidationError,
};
