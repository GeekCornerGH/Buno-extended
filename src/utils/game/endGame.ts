import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel } from "discord.js";

import { customClient } from "../../../typings/client";
import { runningUnoGame, unoLog } from "../../../typings/unoGame";
import { Buno } from "../../database/models/buno";
import { ButtonIDs, cardEmotes, defaultSettings } from "../constants";
import toHumanReadableTime from "../toHumanReadableDate";
import toTitleCase from "./toTitleCase";

export default async function (game: runningUnoGame, client: customClient, reason: "notEnoughPeople" | "win", winner?: string) {
    const calledTimestamp = new Date();
    if (!game._modified && reason === "win") {
        game.players.concat(game.playersWhoLeft).forEach(async p => {
            const dbReq = await Buno.findOne({
                where: {
                    userId: p,
                    guildId: game.guildId
                }
            });
            if (!dbReq) await Buno.create({
                userId: p,
                guildId: game.guildId,
                wins: winner && p === winner ? 1 : 0,
                losses: !winner || p !== winner ? 1 : 0,
                settings: {
                    ...defaultSettings
                }
            });
            else {
                const toSet: { wins?: number, losses?: number } = {};
                if (winner && winner === p) toSet.wins = dbReq ? dbReq.getDataValue("wins") + 1 : 1;
                else toSet.losses = dbReq ? dbReq.getDataValue("losses") + 1 : 1;
                await Buno.update({
                    ...toSet
                }, {
                    where: {
                        userId: p,
                        guildId: game.guildId
                    }
                });
            }
        });
        if (winner) {
            const dbReq = await Buno.findOne({
                where: {
                    userId: winner,
                    guildId: game.guildId
                }
            });
            if (!dbReq) await Buno.create({
                userId: winner,
                guildId: game.guildId,
                wins: 1,
                losses: 0,
                settings: {
                    ...defaultSettings
                }
            });
            else await Buno.update({
                wins: dbReq.getDataValue("wins") + 1
            }, {
                where: {
                    userId: winner,
                    guildId: game.guildId,
                }
            });
        }
    }
    const card = () => {
        const mostUsed = findMostProperty(game.log, "card");
        return `${cardEmotes[mostUsed]} ${toTitleCase(mostUsed)}`;
    };
    const player = () => {
        const mostUsed = findMostProperty(game.log, "player");
        return `${client.guilds.cache.get(game.guildId).members.cache.get(mostUsed)}`;
    };
    (client.channels.cache.get(game.channelId) as GuildTextBasedChannel).send({
        content: game.players.length === 0 ? "No one was available to finish the game." : `**${reason === "win" || game.players.length > 0 ? client.guilds.cache.get(game.guildId).members.cache.get(winner ?? game.currentPlayer).displayName : "[This shouldn't be there]"}** has won the game${reason === "notEnoughPeople" ? " by default" : ""}.`,
        embeds: [
            new EmbedBuilder()
                .setTitle("Game statistics")
                .setColor("Random")
                .addFields([
                    {
                        name: "🏆 Winner",
                        value: `${reason === "win" || game.players.length > 0 ? client.guilds.cache.get(game.guildId).members.cache.get(winner ?? game.currentPlayer).displayName : "No winner "}`
                    }, {
                        name: "🃏 Most played card",
                        value: `${card()}`
                    }, {
                        name: "👤 Player who has played the most cards",
                        value: `${player()}`
                    }, {
                        name: "👥 Players who took part in the game",
                        value: `${game.players.concat(game.playersWhoLeft).length} players`
                    }, {
                        name: "⏱️ The game lasted for",
                        value: `${toHumanReadableTime(Math.round((calledTimestamp.getTime() - game.startingDate.getTime()) / 1000))}`
                    }
                ])
        ],
        components: [new ActionRowBuilder<ButtonBuilder>().setComponents([
            new ButtonBuilder()
                .setCustomId(ButtonIDs.DISABLED_BUTTON)
                .setEmoji("🏆")
                .setLabel(reason === "win" ? "GG" : "\u200B")
                .setStyle(ButtonStyle.Success)
                .setDisabled(true)
        ])]
    });
    client.games.splice(client.games.findIndex(g => g === game), 1);
}

function findMostProperty(objects: unoLog[], property: string): string {
    // Probably the most insane line I wrote
    if (!Object.prototype.hasOwnProperty.call(objects[0], property)) return;
    const cardMap: Map<string, number> = objects.reduce((map, obj) => {
        const value = obj[property];
        map.set(value, (map.get(value) || 0) + 1);
        return map;
    }, new Map());

    const mostCommon = Array.from(cardMap.entries()).reduce(
        (maxEntry, [card, count]) => (count > maxEntry[1] ? [card, count] : maxEntry),
        ["", 0]
    )[0];

    return mostCommon;
}
