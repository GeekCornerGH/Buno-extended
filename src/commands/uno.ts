import { randomUUID } from "crypto";
import { ApplicationIntegrationType, Guild, InteractionContextType, Message, MessageCreateOptions, MessageFlags, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import lobbyGameMessage from "../components/lobbyGameMessage.js";
import { Buno } from "../database/models/buno.js";
import { command } from "../typings/command.js";
import { unoGame, waitingUnoGame } from "../typings/unoGame.js";
import { autoStartTimeout, defaultSettings } from "../utils/constants.js";
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
        if (!interaction.inGuild()) return;
        const isGame = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (isGame) {
            lng = isGame.locale;
            return await interaction.reply({
                content: t("strings:errors.gameInChannel", { lng, url: "https://discord.com/channels/" + interaction.guildId + "/" + isGame.channelId + "/" + isGame.messageId }),
                flags: MessageFlags.Ephemeral
            });
        }
        const req = await Buno.findOne({
            where: {
                guildId: interaction.guildId,
                userId: interaction.user.id
            }
        });
        if (!req) await Buno.create({
            userId: interaction.user.id,
            guildId: interaction.guildId,
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
            locale: interaction.guildLocale.split("-")[0], // en-UK --> en
            startsAt: Date.now() + autoStartTimeout,
            state: "waiting",
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            hostId: interaction.user.id,
            uid: randomUUID(),
            players: [interaction.user.id],
            settings,
            guildApp: interaction.inGuild() && ApplicationIntegrationType.GuildInstall in interaction.authorizingIntegrationOwners
        } as unoGame;
        client.games.push(game);
        const message = await interaction.channel?.send(await lobbyGameMessage(client, game as waitingUnoGame, interaction.guild as Guild) as MessageCreateOptions);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.deleteReply();
        game.messageId = message?.id as string;

        setTimeout(() => {
            if (game.state === "waiting") startGame(client, game, true, message as Message);
        }, autoStartTimeout);
        return;
    }
};
