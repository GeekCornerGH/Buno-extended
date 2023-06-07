
import { respond } from "../client.js";
import { JoinButtons } from "../components.js";
import { autoStartTimeout, defaultSettings } from "../constants.js";
import database from "../database.js";
import { games, makeStartMessage } from "../gameLogic/index.js";
import { startGame } from "../gameLogic/notStarted.js";
import timeouts from "../timeouts.js";
import { Command, UnoGame } from "../types";
import { hasStarted } from "../utils.js";

export const cmd = {
    name: "uno",
    aliases: ["buno"],
    execute: (msg, args) => {
        const existingGame = games[msg.channel.id];
        if (existingGame) return respond(msg, `Someone already started a game
Jump: https://discord.com/channels/${existingGame.message.channel.guild.id}/${existingGame.message.channel.id}/${existingGame.message.id}`);
        games[msg.channel.id] = { started: false } as UnoGame<false>;

        const data = database.get(msg.channel.guild.id, msg.author.id);
        const gameObj = {
            uid: Math.random().toString().substring(2),
            started: false,
            starting: Math.floor(Date.now() / 1000) + autoStartTimeout,
            host: msg.author.id,
            settings: data?.preferredSettings ?? { ...defaultSettings },
            players: [msg.author.id],
            _allowSolo: args[0]?.toLowerCase() === "solo",
            _modified: false,
            channelID: msg.channel.id,
            guildID: msg.channel.guild.id
        } as UnoGame<false>;

        respond(msg, {
            embeds: [makeStartMessage(gameObj, msg.channel.guild)],
            components: JoinButtons
        }).then(m => {
            if (!m) {
                delete games[msg.channel.id];
                return msg.createReaction("‼");
            }

            timeouts.delete(gameObj.channelID);
            gameObj.message = m;
            timeouts.set(gameObj.channelID, () => {
                const g = games[msg.channel.id];
                if (!hasStarted(g)) startGame(g, true);
            }, autoStartTimeout * 1000);

            games[msg.channel.id] = gameObj;
        });
    },
} as Command;
