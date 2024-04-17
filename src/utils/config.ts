import { readFileSync } from "fs";
import { parse } from "toml";

import { Config } from "../../typings/config.js";

export const defaultConfig: Config = Object.freeze({
    emoteless: true,
    developerIds: [],
    logChannel: undefined,
});

export let config: Config;
let configFile: Partial<Config>;

try {
    configFile = parse(readFileSync(import.meta.dirname + "/../../config.toml", "utf-8"));
    config = { ...defaultConfig, ...configFile } as Config;
}
catch (e) {
    throw e;
}
