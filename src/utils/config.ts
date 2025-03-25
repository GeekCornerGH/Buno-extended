import { readFileSync } from "fs";
import { parse } from "toml";

import { Config } from "../typings/config.js";

export const defaultConfig: Config = Object.freeze({
    emoteless: true,
    developerIds: [],
    approvalChannel: undefined,
});

const configFile: Partial<Config> = parse(readFileSync(import.meta.dirname + "/../../config.toml", "utf-8"));
export const config: Config = { ...defaultConfig, ...configFile } as Config;
