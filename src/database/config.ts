import { join } from "path";
import { Options } from "sequelize";
import SQLite from "sqlite3";


const path = join(import.meta.filename, "..", "..", "..", "database.sqlite");

export const databaseConfig: Options = {
    dialect: "sqlite",
    storage: path,
    dialectOptions: {
        mode: [SQLite.OPEN_READWRITE, SQLite.OPEN_FULLMUTEX]
    },
    logging: true
};
