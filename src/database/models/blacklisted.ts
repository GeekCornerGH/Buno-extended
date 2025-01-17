import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";

import { sequelize } from "../manager.js";

class Blacklisted extends Model<InferAttributes<Blacklisted>, InferCreationAttributes<Blacklisted>> {
    declare id?: number;
    declare userId: string;
    declare reason: string;
    declare createdAt?: Date;
    declare updatedAt?: Date;
}

Blacklisted.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING(18),
        allowNull: false,
        unique: false
    },
    reason: {
        type: DataTypes.TEXT("long"),
        allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    tableName: "blacklisted",
    sequelize: sequelize,
});

await Blacklisted.sync();

export { Blacklisted };
