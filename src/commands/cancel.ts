import { Permissions } from "oceanic.js";

import { deleteMessage, respond } from "../client.js";
import { games } from "../gameLogic/index.js";
import timeouts from "../timeouts.js";
import { Command } from "../types";

export const cmd = {
    name: "cancel",
    aliases: ["delete", "stop"],
    execute: (msg, args) => {
        const game = games[msg.channel.id];
        if (!game) return respond(msg, "There's no game in this channel");

        const canDeleteGames = msg.member.id === game.host
            || msg.member.permissions.has(Permissions.MANAGE_MESSAGES)
            || msg.channel.permissionsOf(msg.member.id).has(Permissions.MANAGE_MESSAGES)
            || msg.member.permissions.has(Permissions.MODERATE_MEMBERS)
            || msg.channel.permissionsOf(msg.member.id).has(Permissions.MODERATE_MEMBERS);
        const canDeleteOngoingGames = msg.member.permissions.has(Permissions.MANAGE_CHANNELS);
        if (!canDeleteGames) return respond(msg, "You need to be the game host, or have the `Manage Messages` or `Moderate Members` permission to delete games");

        if (!game.started) {
            timeouts.delete(msg.channel.id);
            deleteMessage(game.message);
            delete games[msg.channel.id];
            return respond(msg, `👍 - <@${msg.author.id}> deleted the game in this channel`);
        } else {
            if (!canDeleteOngoingGames) return respond(msg, "You need the `Manage Channels` permission to delete ongoing games");
            timeouts.delete(msg.channel.id);
            deleteMessage(game.message);
            delete games[msg.channel.id];
            return respond(msg, `👍 - <@${msg.author.id}> deleted the game in this channel`);
        }
    },
} as Command;
