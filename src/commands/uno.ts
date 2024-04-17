import { randomUUID } from "crypto";
import { MessageCreateOptions, SlashCommandBuilder } from "discord.js";

import { command } from "../../typings/command.js";
import { unoGame } from "../../typings/unoGame.js";
import lobbyGameMessage from "../components/lobbyGameMessage.js";
import { Buno } from "../database/models/buno.js";
import { autoStartTimeout, defaultSettings } from "../utils/constants.js";
import startGame from "../utils/game/startGame.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("uno")
        .setDescription("Starts a Buno game")
        .setDMPermission(false),
    execute: async (client, interaction) => {
        const isGame = client.games.find(g => g.channelId === interaction.channelId);
        if (isGame) {
            return await interaction.reply({ content: "A game already exists on this channel :point_right: https://discord.com/channels/" + interaction.guildId + "/" + isGame.channelId + "/" + isGame.messageId, ephemeral: true });
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
            state: "waiting",
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            hostId: interaction.user.id,
            uid: randomUUID(),
            players: [interaction.user.id],
            settings
        } as unoGame;
        client.games.push(game);
        const message = await interaction.channel.send(await lobbyGameMessage(game, interaction.guild) as MessageCreateOptions);
        interaction.deferReply({ ephemeral: true });
        interaction.deleteReply();
        game.messageId = message.id;

        setTimeout(() => {
            if (game.state === "waiting") startGame(client, game, true, message);
        }, autoStartTimeout * 1000);
        return;
    }
};
