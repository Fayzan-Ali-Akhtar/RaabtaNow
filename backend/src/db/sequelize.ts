// db/sequelize.ts
import { Sequelize } from "sequelize";
import { DbCfg }     from "./types";

export function makeSequelize(cfg: DbCfg): Sequelize {
  const { DB_USERNAME, DB_PASSWORD, DB_ENDPOINT, DB_NAME } = cfg;

  const [host, portStr] = DB_ENDPOINT.split(":");
  const port = portStr ? Number(portStr) : 5432;

  return new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host,
    port,
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  });
}
