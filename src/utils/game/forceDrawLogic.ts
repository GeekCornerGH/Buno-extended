import { Client, InteractionUpdateOptions, MessageFlags, Snowflake, StringSelectMenuInteraction } from "discord.js";
import { t } from "i18next";

import chooseColor from "../../components/chooseColor.js";
import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { uniqueVariants } from "../constants.js";
import { getUsername } from "../getUsername.js";
import draw from "./draw.js";
import endTurn from "./endTurn.js";
import next from "./next.js";
import playableCard from "./playableCard.js";
import use from "./use.js";

export default async function forceDrawLogic(game: runningUnoGame, card: unoCard | "draw", player: Snowflake, client: Client, interaction: StringSelectMenuInteraction | null) {
    let toAppend = "";
    const lng = game.locale;
    const filtered = playableCard(game.cards[player] as unoCard[], game.currentCard, game).filter(c => (game.settings.allowStacking && (c === "+4" || c.endsWith("-+2")) || (game.settings.reverseAnything && (c.endsWith("-reverse")))));
    if (!filtered && interaction) return interaction.editReply({
        content: t("strings:game.forceDraw.noCard", { lng }),
    });
    const pushedFiltered = [...filtered, "draw"];
    if (!pushedFiltered.includes(card as unoCard) && interaction) return interaction.editReply({
        content: t("strings:game.notPlayable", { lng }),
    });
    use(game, card as unoCard, player);
    if (card.endsWith("-reverse")) {
        if (interaction) {
            if (!game.settings.reverseAnything) return interaction.editReply({ content: t("strings:game.forceDraw.noReverse", { lng }), embeds: [], components: [] });
            if (!pushedFiltered.includes(card as unoCard)) return interaction.editReply({
                content: t("strings:game.notPlayable", { lng }),
                embeds: [],
                components: []
            });
        }
        game.currentCard = card as unoCard;
        game.players = game.players.reverse();
        game.turnProgress = "chooseCard";
        game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
        if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
        if (game.players.length > 2) game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer), 2);
        toAppend += t("strings:game.forceDraw.reverse.reverseMessage", { lng, stack: game.drawStack, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer)), !game.guildApp) });
        game.drawStack = 0;
        endTurn(client, game, interaction, player, "played", toAppend);
    }
    else if (card === "draw") {
        game.cards[game.currentPlayer] = game.cards[game.currentPlayer].concat(draw(game.cardsQuota, game.drawStack));
        if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
        toAppend += t("strings:game.forceDraw.draw", { name: await getUsername(client, game.guildId, game.currentPlayer, !game.guildApp), stack: game.drawStack, lng });
        game.log.push({
            amount: game.drawStack,
            adminAbused: game.adminAbused,
            card: "forceDraw",
            player: game.currentPlayer
        });
        game.drawStack = 0;
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
        endTurn(client, game, interaction, player, "misc", toAppend);
    } else if (card === "+4") {
        if (!game.settings.allowStacking && interaction) return interaction.editReply({ content: t("strings:game.forceDraw.noStacking", { lng }), embeds: [], components: [] });
        if (!pushedFiltered.includes(card as unoCard) && interaction) return interaction.editReply({
            content: t("strings:game.notPlayable", { lng }),
            embeds: [],
            components: []
        });
        game.turnProgress = "chooseColor";
        game.playedCard = card as typeof uniqueVariants[number];
        if (interaction) return interaction.editReply({
            ...chooseColor(card as typeof uniqueVariants[number], game.locale) as InteractionUpdateOptions
        });
    }
    else if (card.endsWith("-+2")) {
        if (!game.settings.allowStacking && interaction) return interaction.editReply({ content: t("strings:game.forceDraw.noStacking", { lng }), embeds: [], components: [] });
        if (!pushedFiltered.includes(card as unoCard) && interaction) return interaction.editReply({
            content: t("strings:game.notPlayable", { lng }),
            embeds: [],
            components: []
        });
        game.currentCard = card as unoCard;
        if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-+2") || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c === card.split("-")[0] + "-reverse"))) {
            game.drawStack += 2;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === player));
        }
        else {
            game.drawStack += 2;
            toAppend = t("strings:game.forceDraw.draw", { name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer)), !game.guildApp), lng, stack: game.drawStack });
            if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
            game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
            game.turnProgress = "chooseCard";
            game.drawStack = 0;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === player), 2);
        }
        endTurn(client, game, interaction, player, "misc", toAppend);
    }
}
