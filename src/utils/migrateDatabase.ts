import { configDotenv } from "dotenv";
import { readdirSync, readFileSync } from "fs";

import { Buno } from "../database/models/buno.js";
import { unoSettings } from "../typings/unoGame.js";

configDotenv();

const path = import.meta.dirname + "/../../database/";

const folder = readdirSync(path).filter(f => f.endsWith(".json"));
for (const fileName of folder) {
    const file = readFileSync(path + fileName, "utf-8");
    const guildId = fileName.split(".")[0];
    const data = JSON.parse(file) as jsonDb;
    if (!data) throw new Error(fileName + " is not a proper JSON file, please fix that");
    const array = Object.entries(data);
    for (const e of array) {
        if (e[0] === "settingsVersion") continue;
        else {
            if ((process.env.IGNORED_PLAYERS && process.env.IGNORED_PLAYERS.split(",").includes(e[0]))) continue;
            else {
                const req = await Buno.findOne({
                    where: {
                        userId: e[0],
                        guildId
                    }
                });
                if (req) console.log("This user/guild pair already exists");
                else {
                    await Buno.create({
                        userId: e[0],
                        guildId,
                        wins: e[1].wins,
                        losses: e[1].losses,
                        settings: {
                            ...e[1].preferredSettings
                        },
                    });
                    console.log("Migrated user " + e[0] + " from guild " + guildId);
                }
            }
        }
    }
}

type jsonDb = {
    [user: string]: {
        wins: number,
        losses: number,
        preferredSettings: unoSettings
    }
}
