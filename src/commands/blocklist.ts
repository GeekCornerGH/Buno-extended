import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import { command } from "../typings/command.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.eval.command.name"))
        .setDescription(t("strings:commands.blacklist.command.description"))
        .setNameLocalizations(generateLocalized("strings:commands.blocklist.command.name"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.description"))
        .addSubcommand(c => c
            .setName(t("strings:commands.blacklist.command.subcommands.add.name"))
            .setDescription(t("strings:commands.blacklist.command.subcommands.add.description"))
            .addUserOption(o => o
                .setName(t("strings:commands.blacklist.command.subcommands.add.options.target.name"))
                .setNameLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.add.options.target.name"))
                .setDescription(t("strings:commands.blacklist.command.subcommands.add.options.target.description"))
                .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.add.options.target.description"))
                .setRequired(true)))
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
    execute: async (client, interaction) => {
        const lng = interaction.locale.split("-")[0];
        const target = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason", false);
        switch (interaction.options.getSubcommand()) {
            case "add":
                interaction.reply({
                    content: t("strings:commands.blacklist.message.success", { lng, target: target.toString(), reason }),
                    allowedMentions: { parse: [] }
                });
                break;
        }
    }
};
