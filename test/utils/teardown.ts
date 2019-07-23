/* eslint no-console:0 */
import { getConnection } from "typeorm";

const teardown = async (): Promise<void> => {
  console.log("Closing DB Connection");
  const connection = await getConnection();
  await connection.close();
};

export default teardown;
