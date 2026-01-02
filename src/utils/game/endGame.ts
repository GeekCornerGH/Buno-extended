import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GuildTextBasedChannel, Snowflake } from "discord.js";
import { t } from "i18next";

import { Buno } from "../../database/models/buno.js";
import { runningUnoGame, unoCard, unoLog } from "../../typings/unoGame.js";
import { config } from "../config.js";
import { ButtonIDs, cardEmotes, coloredUniqueCards, colorEmotes, defaultSettings, maxActionShownInUserApp, uniqueVariants } from "../constants.js";
import { getUsername } from "../getUsername.js";
import toHumanReadableTime from "../toHumanReadableTime.js";
import toTitleCase from "./toTitleCase.js";
import { games } from "../../database/models/games.js";

export default async function (game: runningUnoGame, client: Client, reason: "notEnoughPeople" | "win", winner?: string) {
    const calledTimestamp = new Date();
    const lng = game.locale;
    const entierePlayerList = game.players.concat(game.playersWhoLeft);
    if (!game._modified && reason === "win") {
        for (const p of entierePlayerList) {
            const dbReq = await Buno.findOne({
                where: {
                    userId: p,
                    guildId: game.guildId ?? game.channelId
                }
            });
            if (!dbReq) await Buno.create({
                userId: p,
                guildId: game.guildId ?? game.channelId,
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
                        guildId: game.guildId ?? game.channelId
                    }
                });
            }
        }
        if (winner) {
            const dbReq = await Buno.findOne({
                where: {
                    userId: winner,
                    guildId: game.guildId ?? game.channelId
                }
            });
            if (!dbReq) await Buno.create({
                userId: winner,
                guildId: game.guildId ?? game.channelId,
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
                    guildId: game.guildId ?? game.channelId,
                }
            });
        }
    }
    const mostPlayedCardName = findMostProperty(game.log.filter((c: unoLog) => c.card !== "draw" && c.card !== "forceDraw"), "card");
    const mostPlayedCard: () => string = () => {
        const isUnique = uniqueVariants.includes(mostPlayedCardName[0] as typeof uniqueVariants[number]);
        const mostPlayedCardEmote = isUnique ? config.emoteless ? colorEmotes.other : coloredUniqueCards[mostPlayedCardName[0] as keyof typeof coloredUniqueCards] : cardEmotes[mostPlayedCardName[0] as unoCard];

        return `${mostPlayedCardEmote} ${toTitleCase(mostPlayedCardName[0], lng)} (${t("strings:words.time", { lng, count: mostPlayedCardName[1] })})`;
    };
    const mostActivePlayer = await getUsername(client, game.guildId, findMostProperty(game.log.filter(p => p.player !== "0"), "player")[0], !game.guildApp);
    const players = [...game.players, ...game.playersWhoLeft];
    const playerNames = await Promise.all(players.map(async (p: Snowflake) => {
        const name = await getUsername(client, game.guildId, p, !game.guildApp);
        return [p, name];
    }));

    const playerNamesObj = Object.fromEntries(playerNames);
    const playerList = t("strings:game.end.embed.stats.playersDesc", { amount: players.length, players: players.map(p => playerNamesObj[p]).join(", "), lng });

    const wonMsg = game.players.length === 0 ? t("strings:game.end.noOne", { lng }) : t("strings:game.end.default", {
        name: reason === "win" || game.players.length > 0 ? await getUsername(client, game.guildId, winner ?? game.currentPlayer, !game.guildApp) : "[This shouldn't be there]",
        default: reason === "notEnoughPeople" ? " by default" : "",
        lng
    });
    if (!game.guildApp) game.previousActions?.push(wonMsg);
    const endMsg = {
        content: game.guildApp ? wonMsg : game.previousActions?.reverse().splice(0, maxActionShownInUserApp).reverse().join("\n"),
        embeds: [
            new EmbedBuilder()
                .setTitle(t("strings:game.end.embed.title", { lng }))
                .setColor("Random")
                .addFields([
                    {
                        name: t("strings:game.end.embed.stats.winner", { lng }),
                        value: `${reason === "win" || game.players.length > 0 ? await getUsername(client, game.guildId, winner ?? game.currentPlayer, !game.guildApp) : t("strings:game.end.noWinner", { lng })}`
                    }, {
                        name: t("strings:game.end.embed.stats.mostPlayedCard", { lng }),
                        value: `${mostPlayedCard() as string}`
                    }, {
                        name: t("strings:game.end.embed.stats.mostActivePlayer", { lng }),
                        value: `${mostActivePlayer} (${t("strings:words.time", { lng, count: findMostProperty(game.log, "player")[1] })})`
                    }, {
                        name: t("strings:game.end.embed.stats.players", { lng }),
                        value: `${playerList}`
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
    };
    if (game.guildApp) await (client.channels.cache.get(game.channelId) as GuildTextBasedChannel).send(endMsg);
    else await game.interaction.editReply({
        ...endMsg,
        message: game.messageId
    });
    client.games.splice(client.games.findIndex(g => g === game), 1);
    if (!game._modified) await games.create({
        ...game,
        players: entierePlayerList,
    });
}

function findMostProperty(objects: unoLog[], property: string): [string, number] {
    // Probably the most insane line I wrote
    if (!Object.prototype.hasOwnProperty.call(objects[0], property)) return ["", 0];
    const cardMap: Map<string, number> = objects.reduce((map, obj) => {
        const value = obj[property as keyof unoLog];
        map.set(value, (map.get(value) || 0) + 1);
        return map;
    }, new Map());

    const mostCommon = Array.from(cardMap.entries()).reduce(
        (maxEntry, [card, count]) => (count > maxEntry[1] ? [card, count] : maxEntry),
        ["", 0]
    );
    return mostCommon;
}
