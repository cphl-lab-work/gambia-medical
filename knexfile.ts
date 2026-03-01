import type { Knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config();

function parseDbUrl(rawUrl: string): { url: string; schema: string } {
  try {
    const parsed = new URL(rawUrl);
    const schema = parsed.searchParams.get("schema") ?? "public";
    parsed.search = "";
    return { url: parsed.toString(), schema };
  } catch {
    return { url: rawUrl, schema: "public" };
  }
}

const rawUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER ?? "postgres"}:${process.env.DB_PASSWORD ?? "postgres"}@${process.env.DB_HOST ?? "localhost"}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME ?? "hmis"}`;

const { url: connectionUrl, schema } = parseDbUrl(rawUrl);

const shared: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: connectionUrl,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  },
  searchPath: [schema, "public"],
  migrations: {
    directory: "./src/knex/migrations",
    extension: "ts",
    tableName: "knex_migrations",
    schemaName: schema,
  },
  pool: { min: 2, max: 10 },
};

const config: Record<string, Knex.Config> = {
  development: shared,
  production: { ...shared, pool: { min: 2, max: 20 } },
  test: {
    ...shared,
    connection: {
      connectionString: process.env.TEST_DATABASE_URL ?? connectionUrl,
    },
  },
};

export default config;
