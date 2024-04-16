import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";

import { unoSettings } from "../../../typings/unoGame.js";
import { sequelize } from "../manager.js";

class Buno extends Model<InferAttributes<Buno>, InferCreationAttributes<Buno>> {
    declare id: number;
    declare userId: string;
    declare guildId: string;
    declare settings: unoSettings;
    declare wins: number;
    declare losses: number;
    declare createdAt: Date;
    declare updatedAt: Date;
}

Buno.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING(18),
        allowNull: false,
        unique: false
    },
    guildId: {
        type: DataTypes.STRING(18),
        allowNull: false
    },
    settings: {
        type: DataTypes.JSON
    },
    wins: {
        type: DataTypes.BIGINT,
    },
    losses: {
        type: DataTypes.BIGINT
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, {
    tableName: "buno",
    sequelize: sequelize,
});

await Buno.sync();

export { Buno };
