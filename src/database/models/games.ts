import { Snowflake } from "discord.js";
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";

import { unoLog, unoSettings } from "../../typings/unoGame.js";
import { sequelize } from "../manager.js";

class games extends Model<InferAttributes<games>, InferCreationAttributes<games>> {
    declare hostId: Snowflake;
    declare players: Array<Snowflake>;
    declare settings: unoSettings;
    declare locale: string;
    declare guildId: Snowflake;
    declare channelId: Snowflake;
    declare guildApp: boolean;
    declare log: unoLog[];
    declare turnCount: number;
    declare startingDate: Date;
    declare duration: number;
}

games.init({
    hostId: {
        allowNull: false,
        type: DataTypes.STRING
    },
    players: {
        allowNull: false,
        type: DataTypes.JSON
    },
    settings: {
        allowNull: false,
        type: DataTypes.JSON
    },
    locale: {
        allowNull: false,
        type: DataTypes.STRING
    },
    guildId: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    channelId: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    guildApp: {
        allowNull: false,
        type: DataTypes.BOOLEAN
    },
    log: {
        allowNull: false,
        type: DataTypes.JSON
    },
    turnCount: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    startingDate: {
        allowNull: false,
        type: DataTypes.DATE
    },
    duration: {
        allowNull: true,
        type: DataTypes.NUMBER
    }
}, {
    sequelize,
    tableName: "games"
});

await games.sync();

export { games };
