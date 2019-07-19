import execa from "execa";
import { testDbConnection } from "./testConnections";

// Clear out the test database
testDbConnection(true).then((): void => process.exit());

// Start the MQTT broker
execa.sync("docker-compose", ["up", "-d", "mqtt"], { stdio: "inherit" });
