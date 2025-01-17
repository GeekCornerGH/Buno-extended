import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import { command } from "../typings/command.js";
import { config } from "../utils/config.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.stop.command.name", { lng: "en" }))
        .setDescription(t("strings:commands.stop.command.description", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.stop.command.name"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.stop.command.description"))
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const lng = interaction.locale.split("-")[0];
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!config.developerIds.includes(interaction.user.id) && (interaction.member.permissions as PermissionsBitField).has(PermissionFlagsBits.ManageMessages)) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            ephemeral: true
        });
        if (game.state !== "waiting") return interaction.reply({
            content: t("strings:errors.inProgress", { lng }),
            ephemeral: true
        });
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member || !member.permissions.has(PermissionFlagsBits.ManageMessages) && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.forbidden", { lng }),
            ephemeral: true
        });
        await interaction.deferReply({
            ephemeral: true
        });
        const msg = interaction.channel?.messages.cache.get(game.messageId);
        if (msg) await msg.delete();
        client.games.splice(client.games.findIndex(g => g === game), 1);
        interaction.channel?.send({
            content: t("strings:game.states.stopped", { lng: game.locale, user: interaction.user.toString() }),
            embeds: [new EmbedBuilder()
                .setColor("Red")
                .setImage("https://media.tenor.com/TuaZhZCF4HQAAAAi/lucosgif.gif")
            ],
            allowedMentions: { parse: [] }
        });
        await interaction.deleteReply();
    }
};
