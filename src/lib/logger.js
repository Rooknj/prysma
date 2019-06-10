const { createLogger, format, transports } = require("winston");

// Font styles: bold, dim, italic, underline, inverse, hidden, strikethrough.
// Font foreground colors: black, red, green, yellow, blue, magenta, cyan, white, gray, grey.
// Background colors: blackBG, redBG, greenBG, yellowBG, blueBG magentaBG, cyanBG, whiteBG
const colors = { info: "cyan", warn: "yellow", error: "red" };

const upperLogLevel = format(info => {
  return Object.assign(info, { level: info.level.toUpperCase() });
});

const printfTransform = info => {
  let message = `${info.timestamp} [${info.level}]: ${info.message} ${info.ms}`;
  if (info.stack) {
    message = `${message}\n${info.stack}`;
  }
  return message;
};

const customFormat = format.combine(
  format.timestamp(),
  format.ms(),
  format.errors({ stack: true }),
  upperLogLevel(),
  format.colorize({ colors, all: true }),
  format.align(),
  format.printf(printfTransform)
);

const logger = createLogger({
  format: customFormat,
  transports: [new transports.Console()],
});

module.exports = logger;
