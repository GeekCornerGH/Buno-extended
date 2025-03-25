import { Snowflake } from "discord.js";
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";

import { sequelize } from "../manager.js";

class everywhereAccess extends Model<InferAttributes<everywhereAccess>, InferCreationAttributes<everywhereAccess>> {
    declare userId: Snowflake;
    declare status: state;
}

everywhereAccess.init({
    userId: {
        allowNull: false,
        type: DataTypes.STRING
    },
    status: {
        allowNull: false,
        type: DataTypes.STRING
    }
}, {
    sequelize,
    tableName: "everywhereAccess"
});

await everywhereAccess.sync();

enum state {
    // eslint-disable-next-line no-unused-vars
    pending = "pending",
    // eslint-disable-next-line no-unused-vars
    accepted = "accepted"
}

export { everywhereAccess, state };
