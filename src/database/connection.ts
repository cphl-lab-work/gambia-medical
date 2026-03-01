import "reflect-metadata";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";

let connection: DataSource | null = null;

export async function getConnection(): Promise<DataSource> {
  if (connection?.isInitialized) {
    return connection;
  }
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  connection = AppDataSource;
  return connection;
}

export async function getRepository<T>(entity: new () => T) {
  const ds = await getConnection();
  return ds.getRepository(entity as never);
}
