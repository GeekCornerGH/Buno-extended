import { ButtonInteraction, Client, InteractionUpdateOptions, Snowflake, StringSelectMenuInteraction, TextChannel } from "discord.js";
import { t } from "i18next";

import chooseColor from "../../components/chooseColor.js";
import pickPlayer from "../../components/pickPlayer.js";
import playCard from "../../components/playCard.js";
import runningGameMessage from "../../components/runningGameMessage.js";
import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { colors, maxDrawAsSabotage, uniqueVariants, variants } from "../constants.js";
import { getUsername } from "../getUsername.js";
import { aiPlay } from "./aiPlay.js";
import draw from "./draw.js";
import draw4 from "./draw4.js";
import endTurn from "./endTurn.js";
import forceDrawLogic from "./forceDrawLogic.js";
import next from "./next.js";
import playableCardsFn from "./playableCard.js";
import { swapCards } from "./swapCards.js";
import use from "./use.js";

export default async function (game: runningUnoGame, card: unoCard | "draw" | "skip", interaction: StringSelectMenuInteraction | ButtonInteraction | null, lng: string, client: Client) {
    const { currentCard } = game;
    const index = game.cards[game.currentPlayer].findIndex(c => c === card);
    const [color, type] = card.split("-") as [typeof colors[number], typeof variants[number] | typeof uniqueVariants[number]];
    const playableCards: Array<unoCard | "skip" | "draw"> = playableCardsFn(game.cards[game.currentPlayer], currentCard, game);
    playableCards.push("draw");
    if (game.canSkip) playableCards.push("skip");
    if (!playableCards.includes(card) && interaction) return interaction.editReply({
        content: t("strings:game.notPlayable", { lng }),
        components: []
    });
    let toAppend: string = "";
    if (card === "draw" && game.drawStack > 0) return forceDrawLogic(game, card, game.currentPlayer, client, interaction as StringSelectMenuInteraction | null);
    if (card === "draw") {
        console.log(card);
        if (game.saboteurs[game.currentPlayer] && game.saboteurs[game.currentPlayer] >= maxDrawAsSabotage) {
            game.players.splice(game.players.findIndex(p => p === game.currentPlayer), 1);
            game.playersWhoLeft.push(game.currentPlayer);
            toAppend = t("strings:game.draw.sab", { lng, name: await getUsername(client, game.guildId, game.currentPlayer, !game.guildApp) });
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
            return endTurn(client, game, interaction, game.currentPlayer, "misc", toAppend, false);
        }
        if ((game.cards[game.currentPlayer].filter(c => uniqueVariants.includes(c as typeof uniqueVariants[number]) || c.startsWith(game.currentCard.split("-")[0]) || c.endsWith(game.currentCard.split("-")[1])))[0]) {
            if (game.saboteurs[game.currentPlayer]) game.saboteurs[game.currentPlayer] += 1;
            else game.saboteurs[game.currentPlayer] = 1;
        }
        else if (game.saboteurs[game.currentPlayer] && game.saboteurs[game.currentPlayer] > 0) game.saboteurs[game.currentPlayer] -= 1;
        const newCard = draw(game.cardsQuota, 1)[0];
        game.cards[game.currentPlayer].push(newCard);
        if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
        if (!game.settings.allowSkipping) {
            const tempPlayer = game.currentPlayer;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer));
            return endTurn(client, game, interaction, tempPlayer, "misc", t("strings:game.draw.drew", { lng, name: await getUsername(client, game.guildId, tempPlayer, !game.guildApp) }), false);
        }
        game.canSkip = true;
        game.log.push({ card: "draw", player: game.currentPlayer });
        const drewMessage = t("strings:game.draw.drew", { lng, name: await getUsername(client, game.guildId, game.currentPlayer, !game.guildApp) });
        if (game.guildApp && game.currentPlayer.startsWith("AI-")) aiPlay(client, game);
        if (game.guildApp) {
            (client.channels.cache.get(game.channelId) as TextChannel).send(drewMessage);
        }
        if (interaction) {
            const toSend = await playCard(client, interaction, game, interaction.user.id, game.canSkip, newCard) as InteractionUpdateOptions;
            if (!game.guildApp) {
                game.previousActions.push(drewMessage);
                await interaction.editReply({
                    message: game.messageId,
                    content: drewMessage
                });
            }
            if (Object.keys(toSend).length === 0) return;
            return await interaction.editReply({ ...toSend });
        }
    }
    else if (card === "skip") {
        const tempPlayer = game.currentPlayer;
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer));
        game.canSkip = false;
        return endTurn(client, game, interaction, tempPlayer, "misc", t("strings:game.draw.skip", { lng, name: await getUsername(client, game.guildId, tempPlayer, !game.guildApp) }), false);
    }
    else if (index < 0 && interaction) {
        const msg = t("strings:game.card.unknown", { lng, name: await getUsername(interaction.client, game.guildId, interaction.user.id, !game.guildApp) });
        if (game.guildApp) await (client.channels.cache.get(game.channelId) as TextChannel)?.send(msg);
        else {
            game.previousActions.push(msg);
            return await interaction.editReply({
                message: game.messageId,
                ...await runningGameMessage(interaction.client, game) as InteractionUpdateOptions
            });
        }
        return interaction.editReply({
            content: "nuh uh ☝️",
            components: []
        });
    }
    else {
        use(game, card as unoCard, game.currentPlayer);
        if (uniqueVariants.includes(card as typeof uniqueVariants[number]) && interaction) {
            game.turnProgress = "chooseColor";
            game.playedCard = card as typeof uniqueVariants[number];
            return interaction.editReply({
                ...chooseColor(card as typeof uniqueVariants[number], game.locale) as InteractionUpdateOptions
            });
        }
        if (type === "reverse") {
            game.currentCard = card as unoCard;
            game.players = game.players.reverse();
            const tempPlayer = game.currentPlayer;
            if (game.players.length <= 2) toAppend = t("strings:game.card.skippedPlayer", { lng, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === tempPlayer)), !game.guildApp) });
            else {
                toAppend = t("strings:game.card.reversed", { lng });
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer));
            }
            endTurn(client, game, interaction, tempPlayer, "played", toAppend);
        }
        else if (type === "block") {
            game.currentCard = card as unoCard;
            const tempPlayer = game.currentPlayer;
            toAppend = t("strings:game.card.skippedPlayer", { lng, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer)), !game.guildApp) });
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer), 2);
            endTurn(client, game, interaction, tempPlayer, "played", toAppend);
        }
        else if (type === "+2") {
            game.currentCard = card as unoCard;
            if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-+2") || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c === color + "-reverse"))) {
                game.drawStack += 2;
                const tempPlayer = game.currentPlayer;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer));
                endTurn(client, game, interaction, tempPlayer, "played");
            }
            else {
                game.drawStack += 2;
                const tempPlayer = game.currentPlayer;
                toAppend = t("strings:game.draw.drewAndSkipped", { lng, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer)), !game.guildApp), stack: game.drawStack });
                if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
                game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
                game.turnProgress = "chooseCard";
                game.drawStack = 0;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer), 2);
                endTurn(client, game, interaction, tempPlayer, "played", toAppend);
            }
        }
        else if (!interaction && type === "+4") {
            game.currentCard = card;
            return draw4(game, toAppend, client, null, card);
        }
        else if (game.settings.sevenAndZero && ["7", "0"].includes(type) && game.cards[game.currentPlayer].length === 0) {
            if (type === "7") {
                if (interaction) {
                    game.turnProgress = "pickPlayer";
                    game.playedCard = card as `${typeof colors[number]}-7`;
                    return interaction.editReply({ ... await pickPlayer(interaction.client, game, interaction.user.id) as InteractionUpdateOptions });
                }
                else return swapCards(game, Object.entries(game.cards)
                    .filter(([key]) => key !== game.currentPlayer)
                    .sort(([, a], [, b]) => a.length - b.length)[0][0], null, client);
            }
            else if (type === "0") {
                game.currentCard = card as unoCard;
                toAppend += t("strings:game.card.allSwapped", { lng });
                const keys = Object.keys(game.cards);
                keys.unshift(keys.pop() as string);
                if (game.settings.shouldYellBUNO) {
                    for (let i = 0; i < keys.length; i++) {
                        if (game.unoPlayers.includes(keys[i])) {
                            game.unoPlayers.splice(game.unoPlayers.indexOf(keys[i]), 1);
                            game.unoPlayers.push(keys[(i + 1) % keys.length]);
                        }
                    }
                }
                const numPlayers = keys.length;
                const newCards: { [userId: Snowflake]: unoCard[] } = {};
                for (let i = 0; i < numPlayers; i++) {
                    const currentPlayerKey = keys[i];
                    const nextPlayerKey = keys[(i + 1) % numPlayers];

                    newCards[currentPlayerKey] = game.cards[nextPlayerKey] as unoCard[];
                }
                game.cards = newCards;
            }
            const tempPlayer = game.currentPlayer;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer));
            endTurn(client, game, interaction, tempPlayer, "played", toAppend);
        }
        else {
            game.currentCard = card as unoCard;
            const tempPlayer = game.currentPlayer;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer));
            endTurn(client, game, interaction, tempPlayer, "played");
        }
    }
}
