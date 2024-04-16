import { Sequelize } from "sequelize";

import { databaseConfig } from "./config";

export const sequelize = new Sequelize(databaseConfig);

try {
    sequelize.getQueryInterface().createDatabase("buno");
}
catch (e) {
    throw e;
}
