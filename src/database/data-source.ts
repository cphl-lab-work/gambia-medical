import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

const dbHost = process.env.DB_HOST ?? "localhost";
const dbPort = parseInt(process.env.DB_PORT ?? "5432", 10);
const dbName = process.env.DB_NAME ?? "hm2";
const dbUser = process.env.DB_USER ?? "postgres";
const dbPassword = process.env.DB_PASSWORD ?? "postgres";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [User],
  migrations: ["src/database/migrations/*.ts"],
  migrationsTableName: "migrations",
});
