/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import rimraf from "rimraf";
import execa, { ExecaChildProcess } from "execa";
import Listr from "listr";
import { promisify } from "util";

const asyncRimraf = promisify(rimraf);

const tasks = new Listr(
  [
    {
      title: "Remove dist folder",
      task: (): Promise<void> => asyncRimraf("dist"),
    },
    {
      title: "Remove build folder",
      task: (): Promise<void> => asyncRimraf("build"),
    },
    {
      title: "Remove coverage folder",
      task: (): Promise<void> => asyncRimraf("coverage"),
    },
    {
      title: "Remove prysma data folder",
      task: (): Promise<void> => asyncRimraf(".prysma"),
    },
    {
      title: "Bring docker containers down",
      task: (): ExecaChildProcess<string> => execa("docker-compose", ["down"]),
    },
  ],
  {
    concurrent: true,
  }
);

tasks.run().catch((err): void => {
  throw err
});
