import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType, InteractionReplyOptions, MessageCreateOptions, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { t } from "i18next";

import { command } from "../typings/command.js";
import { config } from "../utils/config.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";
import timeouts from "../utils/timeoutManager.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.stop.command.name", { lng: "en" }))
        .setDescription(t("strings:commands.stop.command.description", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.stop.command.name"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.stop.command.description"))
        .setContexts([InteractionContextType.Guild])
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
    execute: async (client, interaction) => {
        const lng = interaction.locale.split("-")[0];
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state !== "waiting") return interaction.reply({
            content: t("strings:errors.inProgress", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member || !member.permissions.has(PermissionFlagsBits.ManageMessages) && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.forbidden", { lng }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });
        const msg = interaction.channel?.messages.cache.get(game.messageId);
        if (msg) await msg.delete();
        client.games.splice(client.games.findIndex(g => g === game), 1);
        const toSend = {
            content: t("strings:game.states.stopped", { lng: game.locale, user: interaction.user.toString() }),
            embeds: [new EmbedBuilder()
                .setColor("Red")
                .setImage("https://media.tenor.com/TuaZhZCF4HQAAAAi/lucosgif.gif")
            ],
            allowedMentions: { parse: [] }
        } satisfies MessageCreateOptions | InteractionReplyOptions;
        timeouts.delete(game.channelId);
        if (game.guildApp) {
            (interaction.channel as TextChannel)?.send(toSend);
            await interaction.deleteReply();
        }
        else return interaction.reply(toSend);
    }
};
