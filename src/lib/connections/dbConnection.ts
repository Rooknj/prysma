import { createConnection, Connection, ConnectionOptions } from "typeorm";
import logger from "../logger";

let dbConnection: Connection;

export const initDbConnection = async (options: ConnectionOptions): Promise<Connection> => {
  if (dbConnection) {
    throw new Error("Trying to init dbConnection again!");
  }

  logger.info(`Connecting to database...`);
  dbConnection = await createConnection(options);
  logger.info(`Connected to database`);

  return dbConnection;
};

export const getDbConnection = (): Connection => {
  if (!dbConnection)
    throw new Error("dbConnection has not been initialized. Please call init first.");
  return dbConnection;
};

export const closeDbConnection = async (): Promise<void> => {
  if (dbConnection) {
    logger.info(`Closing dbConnection`);
    await dbConnection.close();
    return;
  }
  logger.info(`dbConnection has not been initialized.`);
};
