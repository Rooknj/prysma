/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { argv } from "yargs";
import execa from "execa";

// Set Environment Variables
process.env.NODE_ENV = "development";

// Crash on unhandled rejections
process.on("unhandledRejection", (err): never => {
  throw err;
});

// Handle cli options
if (argv.mock) {
  console.log("Starting Prysma using mock services");
  process.env.MOCK = "true";
} else if (argv.remote) {
  console.log("Starting Prysma using remote services");
  process.env.MQTT_HOST = "prysma.local";
} else {
  console.log("Starting Prysma using local services");
  // Start docker containers
  console.log("Spinning up Local MQTT broker");
  process.env.MQTT_HOST = "localhost";
  execa.sync("docker-compose", ["up", "-d", "mqtt"], {
    stdio: [process.stdin, process.stdout], // Ignore stderr so nothing prints to the console if this fails.
  });
}

// Start Nodemon
execa.sync("nodemon", ["--ext", "ts", "--watch", "./src", "--exec", "ts-node", "src/index.ts"], {
  stdio: "inherit",
  preferLocal: true
});
