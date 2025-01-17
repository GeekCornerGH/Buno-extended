import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import { command } from "../typings/command.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.blocklist", { lng: "en" }))
        .setDescription(t("strings:commands.blacklist.command.description", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.blocklist"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.description"))
        .addSubcommand(c => c
            .setName(t("strings:commands.blacklist.command.subcommands.add.name", { lng: "en" }))
            .setDescription(t("strings:commands.blacklist.command.subcommands.add.description", { lng: "en" }))
            .addUserOption(o => o
                .setName(t("strings:commands.blacklist.command.subcommands.add.options.target.name", { lng: "en" }))
                .setNameLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.add.options.target.name"))
                .setDescription(t("strings:commands.blacklist.command.subcommands.add.options.target.description", { lng: "en" }))
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
