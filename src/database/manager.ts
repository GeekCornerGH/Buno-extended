import { Sequelize } from "sequelize";

import { databaseConfig } from "./config.js";

export const sequelize = new Sequelize(databaseConfig);

try {
    sequelize.getQueryInterface().createDatabase("buno");
}
catch (e) {
    throw e;
}
