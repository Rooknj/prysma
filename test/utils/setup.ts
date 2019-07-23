/* eslint no-console:0 */
import execa from "execa";
import { testDbConnection } from "./testConnections";

const setup = async (): Promise<void> => {
  // Clear out the test database
  console.log("Clearing Database");
  await testDbConnection(true);

  // Start the MQTT broker
  console.log("Starting MQTT Broker");
  execa.sync("docker-compose", ["up", "-d", "mqtt"], { stdio: "inherit" });
  console.log("Done");
};

export default setup;
