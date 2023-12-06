import { execSync } from "child_process";
import { inspect } from "util";

import { client } from "../client.js";
import * as clientUtils from "../client.js";
import * as components from "../components.js";
import * as constants from "../constants.js";
import database from "../database.js";
import { games } from "../gameLogic/index.js";
import * as gameLogic from "../gameLogic/index.js";
import { config } from "../index.js";
import { Command } from "../types";
import * as utils from "../utils.js";
client; components; gameLogic; database; constants; utils;

const MAX_RESPONSE_LENGTH = 1980;

const bash = (cmd: string) => execSync(cmd, { encoding: "utf8" });
const update = () => bash("git pull && npm run build");
update;

export const cmd = {
    name: "eval",
    aliases: ["adminabuse"],
    execute: (msg, args) => {
        if (!config.developerIds.includes(msg.author.id)) return;
        const code = args.join(" ");
        const reportError = (e: Error): void => {
            const evalPos = e.stack.split("\n").findIndex(l => l.includes("at eval"));
            const stack = e.stack.split("\n").splice(0, evalPos).join("\n");

            clientUtils.respond(msg, `Error\n\`\`\`ts\n${stack}\`\`\``);
        };
        msg.createReaction("👍").catch(() => { });
        try {
            const game = games[msg.channel.id];
            game;

            (eval(`(async function(){${code}})().catch(reportError)`) as Promise<any>).then(evalResult => {
                let result = inspect(evalResult, { depth: 5 });
                if (result.length > MAX_RESPONSE_LENGTH)
                    for (let i = 4; i > 0; i--) {
                        if (result.length > MAX_RESPONSE_LENGTH) result = inspect(evalResult, { depth: i });
                    }

                if (result.length > MAX_RESPONSE_LENGTH) {
                    return clientUtils.respond(msg, {
                        files: [{
                            contents: Buffer.from(inspect(evalResult, { depth: 4 })),
                            name: "output.ts"
                        }]
                    });
                }

                if (result !== "undefined") clientUtils.respond(msg, "```ts\n" + result + "```");
            }).catch(reportError);
        } catch (e) { reportError(e); }
    },
} as Command;
