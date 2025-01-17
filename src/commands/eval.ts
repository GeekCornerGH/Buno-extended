import { inspect } from "node:util";

import { execSync } from "child_process";
import { ApplicationIntegrationType, AttachmentBuilder, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import { Buno } from "../database/models/buno.js";
import { command } from "../typings/command.js";
import { config } from "../utils/config.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";
const MAX_RESPONSE_LENGTH = 1980;
const regex = new RegExp(/(([A-Z]:\\Users\\)|(\/Users\/)|(\/home\/))([^/\\]*)/ig);

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.eval.command.name", { lng: "en" }))
        .setDescription(t("strings:commands.eval.command.description", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.eval.command.name"))
        .addStringOption(o => o.setName(t("strings:commands.eval.command.options.code.name", { lng: "en" }))
            .setDescription(t("strings:commands.eval.command.options.code.description", { lng: "en" }))
            .setNameLocalizations(generateLocalized("strings:commands.eval.command.options.code.name"))
            .setDescriptionLocalizations(generateLocalized("strings:commands.eval.command.options.code.description"))
            .setRequired(true))
        .addBooleanOption(o => o.setName(t("strings:commands.eval.command.options.public.name", { lng: "en" }))
            .setDescription(t("strings:commands.eval.command.options.public.description", { lng: "en" }))
            .setNameLocalizations(generateLocalized("strings:commands.eval.command.options.public.name"))
            .setDescriptionLocalizations(generateLocalized("strings:commands.eval.command.public.description"))
            .setRequired(false))
        .setContexts([InteractionContextType.Guild])
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),
    execute: async (client, interaction) => {
        if (!config.developerIds.includes(interaction.user.id)) return interaction.reply("nuh uh ☝️");
        const showPublic = interaction.options.getBoolean("public", false) || false;
        const bash = (cmd: string) => execSync(cmd, { encoding: "utf8" }).replace(regex, "$1amogus");
        const update = () => {
            const data = bash("git pull && pnpm install && pnpm build");
            if (!data.includes("up to date")) process.exit(1);
            else return data;

        };
        const game = client.games.find(g => g.channelId === interaction.channelId);
        // eslint-disable-next-line no-unused-expressions
        game;
        // eslint-disable-next-line no-unused-expressions
        update;
        // eslint-disable-next-line no-unused-expressions
        Buno;
        await interaction.deferReply({ ephemeral: !showPublic });
        const reportError = async (e: Error): Promise<void> => {
            let stack: string;
            if (e.stack) {
                const evalPos = e.stack.split("\n").findIndex(l => l.includes("at eval"));
                stack = e.stack.split("\n").splice(0, evalPos).join("\n");
            }
            else stack = "No data outputted";
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
        } catch (e) {
            const error = e as Error;
            reportError(error);
        }
        return;
    }
};
