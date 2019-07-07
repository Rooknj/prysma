import { createLogger, format, transports } from "winston";
import { TransformableInfo } from "logform";

// Font styles: bold, dim, italic, underline, inverse, hidden, strikethrough.
// Font foreground colors: black, red, green, yellow, blue, magenta, cyan, white, gray, grey.
// Background colors: blackBG, redBG, greenBG, yellowBG, blueBG magentaBG, cyanBG, whiteBG
const colors = { info: "cyan", warn: "yellow", error: "red" };

// const coloredJSON = format.combine(
//   format.timestamp(),
//   format.errors({ stack: true }),
//   format.json(),
//   format.colorize({ colors, all: true })
// );

const upperLogLevel = format(
  (info): TransformableInfo => {
    return Object.assign(info, { level: info.level.toUpperCase() });
  }
);

const printfTransform = (info: TransformableInfo): string => {
  let message = `${info.timestamp} [${info.level}]: ${info.message} ${info.ms}`;
  if (info.stack) {
    message = `${message}\n${info.stack}`;
  }
  return message;
};

const human = format.combine(
  format.timestamp(),
  format.ms(),
  format.errors({ stack: true }),
  upperLogLevel(),
  format.colorize({ colors, all: true }),
  format.align(),
  format.printf(printfTransform)
);

const logger = createLogger({
  format: human,
  transports: [new transports.Console({})],
});

// Silence all logs if in test mode
if (process.env.NODE_ENV === "test") {
  logger.transports.forEach((t): void => {
    // eslint-disable-next-line no-param-reassign
    t.silent = true;
  });
}

export default logger;
