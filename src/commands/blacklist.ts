import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import { Blacklisted } from "../database/models/blacklisted.js";
import { command } from "../typings/command.js";
import { config } from "../utils/config.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.blacklist.command.name"))
        .setDescription(t("strings:commands.blacklist.command.description"))
        .setNameLocalizations(generateLocalized("strings:commands.blacklist.command.name"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.description"))
        .addSubcommand(c => c
            .setName(t("strings:commands.blacklist.command.subcommands.add.name"))
            .setDescription(t("strings:commands.blacklist.command.subcommands.add.description"))
            .addUserOption(o => o
                .setName(t("strings:commands.blacklist.command.subcommands.add.options.target.name"))
                .setNameLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.add.options.target.name"))
                .setDescription(t("strings:commands.blacklist.command.subcommands.add.options.target.description"))
                .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.add.options.target.description"))
                .setRequired(true))
            .addStringOption(o => o
                .setName(t("strings:commands.blacklist.command.subcommands.add.options.reason.name"))
                .setNameLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.add.options.reason.name"))
                .setDescription(t("strings:commands.blacklist.command.subcommands.add.options.reason.description"))
                .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.add.options.reason.description"))
                .setMaxLength(1000)
                .setRequired(true)
            )
        )
        .addSubcommand(c => c
            .setName(t("strings:commands.blacklist.command.subcommands.remove.name"))
            .setDescription(t("strings:commands.blacklist.command.subcommands.remove.description"))
            .setNameLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.remove.name"))
            .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.remove.description"))
            .addUserOption(o => o
                .setName(t("strings:commands.blacklist.command.subcommands.remove.options.target.name"))
                .setNameLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.remove.options.target.name"))
                .setDescription(t("strings:commands.blacklist.command.subcommands.remove.options.target.description"))
                .setDescriptionLocalizations(generateLocalized("strings:commands.blacklist.command.subcommands.remove.options.target.description"))
                .setRequired(true)))
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
    execute: async (client, interaction) => {
        const lng = interaction.locale.split("-")[0];
        if (!config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        const target = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason", true);
        switch (interaction.options.getSubcommand()) {
            case "add":
                if (await Blacklisted.findOne({
                    where: {
                        userId: target.id
                    }
                })) return interaction.reply({
                    content: t("strings:commands.blacklist.message.already-blacklisted", { lng }),
                    ephemeral: true
                });
                await Blacklisted.create({
                    userId: target.id,
                    reason: reason
                });
                interaction.reply({
                    content: t("strings:commands.blacklist.message.success", { lng, target: target.toString(), reason }),
                    allowedMentions: { parse: [] }

                });
                break;
            case "remove":
                if (!await Blacklisted.findOne({
                    where: {
                        userId: target.id
                    }
                })) return interaction.reply({
                    content: t("strings:commands.blacklist.message.not-blacklisted", { lng }),
                    ephemeral: true
                });
                await Blacklisted.destroy({
                    where: {
                        userId: target.id
                    }
                });
                interaction.reply({
                    content: t("strings:commands.blacklist.message.success-unbl", { lng, target: target.toString() }),
                    allowedMentions: { parse: [] }
                });
                break;
        }
    }
};
