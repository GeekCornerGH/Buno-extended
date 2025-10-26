import { randomUUID } from "crypto";
import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, InteractionContextType, InteractionUpdateOptions, Message, MessageCreateOptions, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import lobbyGameMessage from "../components/lobbyGameMessage.js";
import { Buno } from "../database/models/buno.js";
import { everywhereAccess, state } from "../database/models/everywhereAccess.js";
import { command } from "../typings/command.js";
import { waitingUnoGame } from "../typings/unoGame.js";
import { autoStartTimeout, ButtonIDs, defaultSettings } from "../utils/constants.js";
import startGame from "../utils/game/startGame.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.uno.command.name", { lng: "en" }))
        .setDescription(t("strings:commands.uno.command.description", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.uno.command.name"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.uno.command.description"))
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
    execute: async (client, interaction) => {
        const isGame = client.games.find(g => g.channelId === interaction.channelId);
        const guildApp = interaction.inGuild() && ApplicationIntegrationType.GuildInstall in interaction.authorizingIntegrationOwners;
        let lng = interaction.locale.split("-")[0];
        if (isGame) {
            lng = isGame.locale;
            return await interaction.reply({
                content: t("strings:errors.gameInChannel", { lng, url: "https://discord.com/channels/" + interaction.inGuild() ? interaction.guildId : "@me" + "/" + isGame.channelId + "/" + isGame.messageId }),
                flags: MessageFlags.Ephemeral
            });
        }
        if (!guildApp && interaction.inGuild() && !interaction.memberPermissions.has(PermissionFlagsBits.UseExternalApps | PermissionFlagsBits.EmbedLinks | PermissionFlagsBits.UseExternalEmojis)) {
            return interaction.reply({
                content: t("strings:errors.ephemeral"),
                flags: MessageFlags.Ephemeral
            });
        }
        else if (!guildApp) {
            const hasEverywhereAccess = await everywhereAccess.findOne({
                where: {
                    userId: interaction.user.id,
                }
            });
            if (!hasEverywhereAccess || hasEverywhereAccess.getDataValue("status") === state.pending) {
                return interaction.reply({
                    flags: MessageFlags.Ephemeral,
                    embeds: [new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setTitle(t("strings:access.title", { lng }))
                        .setDescription(t("strings:access.description", { lng }))
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .setComponents([
                                new ButtonBuilder()
                                    .setCustomId(ButtonIDs.REQUEST_ACCESS)
                                    .setStyle(ButtonStyle.Success)
                                    .setDisabled((hasEverywhereAccess && hasEverywhereAccess.getDataValue("status") === state.pending) ?? false)
                                    .setLabel(t("strings:access.button", { lng }))
                            ])
                    ]
                });
            }
        }
        else if (guildApp && !interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.EmbedLinks | PermissionFlagsBits.SendMessages | PermissionFlagsBits.UseExternalEmojis | PermissionFlagsBits.ReadMessageHistory | PermissionFlagsBits.ViewChannel)) return interaction.reply(t("strings:errors.permissions", { lng }));
        await interaction.deferReply({ flags: guildApp ? MessageFlags.Ephemeral : undefined });
        const req = await Buno.findOne({
            where: {
                guildId: interaction.guildId ?? interaction.channelId,
                userId: interaction.user.id
            }
        });
        if (!req) await Buno.create({
            userId: interaction.user.id,
            guildId: interaction.guildId ?? interaction.channelId,
            settings: {
                ...defaultSettings
            },
            wins: 0,
            losses: 0
        });
        let settings = { ...defaultSettings };
        if (req) settings = { ...settings, ...req.getDataValue("settings") };
        const game = {
            _modified: false,
            locale: (interaction.guildLocale ?? interaction.locale).split("-")[0], // en-UK --> en
            startsAt: Date.now() + autoStartTimeout,
            state: "waiting",
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            hostId: interaction.user.id,
            uid: randomUUID(),
            players: [interaction.user.id],
            settings,
            guildApp,
        } as waitingUnoGame;
        client.games.push(game);
        const toSend = await lobbyGameMessage(client, game as waitingUnoGame) satisfies MessageCreateOptions | InteractionUpdateOptions;
        let message: Message | undefined;
        if (guildApp) {
            try {
                message = await interaction.channel?.send(toSend as MessageCreateOptions);
                await interaction.deleteReply();
            }
            catch {
                return await interaction.editReply({ content: t("strings:errors.permissions", { lng }) });
            }
        }
        else message = await interaction.editReply({ ...toSend as InteractionUpdateOptions });
        game.messageId = message?.id as string;
        if (!game.guildApp) game.interaction = interaction;

        setTimeout(() => {
            const currentGame = client.games.find(g => g.channelId);
            if (currentGame && currentGame.uid === game.uid && game.state === "waiting") startGame(client, game, true, message as Message);
        }, autoStartTimeout);
        return;
    }
};
