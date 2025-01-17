import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { t } from "i18next";

import { Buno } from "../../database/models/buno.js";
import { runningUnoGame, unoCard, unoLog } from "../../typings/unoGame.js";
import { ButtonIDs, cardEmotes, defaultSettings } from "../constants.js";
import { getUsername } from "../getUsername.js";
import toHumanReadableTime from "../toHumanReadableTime.js";
import toTitleCase from "./toTitleCase.js";

export default async function (game: runningUnoGame, client: Client, reason: "notEnoughPeople" | "win", winner?: string) {
    const calledTimestamp = new Date();
    const lng = game.locale;
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
        return `${cardEmotes[mostUsed as unoCard] as unknown} ${toTitleCase(mostUsed, lng)}`;
    };
    const player = () => {
        const mostUsed = findMostProperty(game.log, "player");
        return `${client.guilds.cache.get(game.guildId)?.members.cache.get(mostUsed)}`;
    };
    const players = [...game.players, ...game.playersWhoLeft];
    (client.channels.cache.get(game.channelId) as GuildTextBasedChannel).send({
        content: game.players.length === 0 ? t("strings:game.end.noOne", { lng }) : t("strings:game.end.default", {
            name: reason === "win" || game.players.length > 0 ? await getUsername(client, game.guildId, winner ?? game.currentPlayer) : "[This shouldn't be there]",
            default: reason === "notEnoughPeople" ? " by default" : "",
            lng
        }),
        embeds: [
            new EmbedBuilder()
                .setTitle("Game statistics")
                .setColor("Random")
                .addFields([
                    {
                        name: t("strings:game.end.embed.stats.winner", { lng }),
                        value: `${reason === "win" || game.players.length > 0 ? await getUsername(client, game.guildId, winner ?? game.currentPlayer) : t("strings:game.end.noWinner", { lng })}`
                    }, {
                        name: t("strings:game.end.embed.stats.mostPlayedCard", { lng }),
                        value: `${card()}`
                    }, {
                        name: t("strings:game.end.embed.stats.mostPlayedCard", { lng }),
                        value: `${player()}`
                    }, {
                        name: t("strings:game.end.embed.stats.players", { lng }),
                        value: t("strings:game.end.embed.stats.playersDesc", { amount: players.length, players: players.map(async p => await getUsername(client, game.guildId, p)).join(", "), lng })
                    }, {
                        name: t("strings:game.end.embed.stats.duration", { lng }),
                        value: `${toHumanReadableTime(Math.round((calledTimestamp.getTime() - game.startingDate.getTime()) / 1000), lng)}`
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
    if (!Object.prototype.hasOwnProperty.call(objects[0], property)) return "";
    const cardMap: Map<string, number> = objects.reduce((map, obj) => {
        const value = obj[property as keyof unoLog];
        map.set(value, (map.get(value) || 0) + 1);
        return map;
    }, new Map());

    const mostCommon = Array.from(cardMap.entries()).reduce(
        (maxEntry, [card, count]) => (count > maxEntry[1] ? [card, count] : maxEntry),
        ["", 0]
    )[0];

    return mostCommon;
}
