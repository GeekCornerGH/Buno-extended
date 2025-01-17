import { Sequelize } from "sequelize";

import { databaseConfig } from "./config.js";

export const sequelize = new Sequelize(databaseConfig);
sequelize.getQueryInterface().createDatabase("buno");
