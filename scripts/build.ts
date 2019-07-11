/* eslint-disable-next-line spaced-comment */
/// <reference types="./@types/pkg" />

/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
// import { argv } from "yargs";
import path from "path";
import execa, { ExecaChildProcess } from "execa";
import Listr from "listr";
import { argv } from "yargs";
import { exec } from "pkg";
// @ts-ignore
import { name, version } from "../package.json";

const EXECUTABLE_NAME = name;
const BUILD_FOLDER = "build";

// Set Environment Variables
process.env.NODE_ENV = "production";

// Crash on unhandled rejections
process.on("unhandledRejection", (err): never => {
  throw err;
});

const buildExecutable = (): Promise<void> => {
  // BUILD: Build an executable with pkg
  let target: string;
  if (process.env.PKG_TARGET) {
    // Run pkg with this target
    target = process.env.PKG_TARGET;
  } else {
    switch (process.platform) {
      case "darwin": // mac
        target = "node10-macos-x64";
        break;
      case "win32": // windows
        target = "node10-win-x64";
        break;
      case "linux": // linux
        target = "node10-linux-x64";
        break;
      default:
        throw new Error("No target specified");
    }
  }

  const outputFile = `./${BUILD_FOLDER}/${EXECUTABLE_NAME}`;
  return exec([".", "--target", target, "--output", outputFile]).then((): void => {
    console.log(`Executable located at ${path.join(BUILD_FOLDER, EXECUTABLE_NAME)}`);
  });
};

console.log(`🛠  Building ${name} v${version} 🛠`);
const tasks = new Listr(
  [
    {
      title: "Compile Typescript",
      task: (): ExecaChildProcess<string> => execa("tsc"),
    },
    {
      title: "Build Executable",
      enabled: (): boolean => !!argv.exe,
      task: (): Promise<void> => buildExecutable(),
    },
  ],
  { renderer: "verbose" }
);

tasks.run().catch((err): void => {
  throw err;
});
