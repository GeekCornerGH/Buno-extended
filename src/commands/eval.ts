import { inspect } from "node:util";

import { execSync } from "child_process";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";

import { command } from "../../typings/command";
import { Buno } from "../database/models/buno";
import { config } from "../utils/config";
const MAX_RESPONSE_LENGTH = 1980;
const regex = new RegExp(/(([A-Z]:\\Users\\)|(\/Users\/)|(\/home\/))([^/\\]*)/ig);

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Evals code")
        .addStringOption(o => o.setName("code").setDescription("Code to execute").setRequired(true))
        .addBooleanOption(o => o.setName("public").setDescription("Whenever to show the ouput as public message or not").setRequired(false))
        .setDMPermission(false),
    execute: async (client, interaction) => {
        if (!config.developerIds.includes(interaction.user.id)) return interaction.reply("nuh uh ☝️");
        const showPublic = interaction.options.getBoolean("public", false) || false;
        const bash = (cmd: string) => execSync(cmd, { encoding: "utf8" }).replace(regex, "$1amogus");
        const update = () => bash("git pull && pnpm install && pnpm build");
        const game = client.games.find(g => g.channelId === interaction.channelId);
        // eslint-disable-next-line no-unused-expressions
        game;
        // eslint-disable-next-line no-unused-expressions
        update;
        // eslint-disable-next-line no-unused-expressions
        Buno;
        await interaction.deferReply({ ephemeral: !showPublic });
        const reportError = async (e: Error): Promise<void> => {
            const evalPos = e.stack.split("\n").findIndex(l => l.includes("at eval"));
            const stack = e.stack.split("\n").splice(0, evalPos).join("\n");

            await interaction.editReply(`Error\n\`\`\`ts\n${stack}\`\`\``);
        };
        try {
            const evalResult = await (eval(`(async function(){
                ${interaction.options.getString("code")}
            })().catch(reportError)`) as Promise<any>).catch(reportError);
            if (typeof evalResult !== "undefined") {
                let result = evalResult;
                if (typeof evalResult !== "string" && typeof evalResult !== "undefined") {
                    result = inspect(evalResult, { depth: 4 });
                }
                result = result.replaceAll(client.token, "amogus").replaceAll(interaction.token, "amogus").replace(regex, "$1amogus");

                if (result.length > MAX_RESPONSE_LENGTH) {
                    return interaction.editReply({
                        files: [new AttachmentBuilder(Buffer.from(result)).setName("output.ts")]
                    });
                }
                if (result && typeof result !== "undefined") interaction.editReply("```ts\n" + result + "```");
            }
            else if (!interaction.replied) interaction.editReply("No data was returned.");
        } catch (e) { reportError(e); }
        return;
    }
};
