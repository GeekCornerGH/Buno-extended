
import { InteractionUpdateOptions, MessageFlags } from "discord.js";
import { t } from "i18next";

import chooseColor from "../../components/chooseColor.js";
import { stringSelect } from "../../typings/stringSelect.js";
import { unoCard } from "../../typings/unoGame.js";
import { SelectIDs, uniqueVariants } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import playableCard from "../../utils/game/playableCard.js";
import use from "../../utils/game/use.js";
import { getUsername } from "../../utils/getUsername.js";

export const s: stringSelect = {
    name: SelectIDs.FORCEFUL_DRAW,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        const card = interaction.values[0] as unoCard | typeof uniqueVariants[number];

        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.drawStack === 0) return interaction.reply({
            content: t("strings:errors.noDrawStack", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const playedCard = interaction.values[0] as unoCard | "draw";
        if (!playedCard) return interaction.reply({
            content: t("strings:game.forceDraw.playACard", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const filtered = playableCard(game.cards[interaction.user.id] as unoCard[], game.currentCard).filter(c => (game.settings.allowStacking && (c === "+4" || c.endsWith("-+2")) || (game.settings.reverseAnything && (c.endsWith("-reverse")))));
        if (!filtered) return interaction.reply({
            content: t("strings:game.forceDraw.noCard", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const pushedFiltered = [...filtered, "draw"];
        if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.reply({
            content: t("strings:game.notPlayable", { lng }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        let toAppend = "";
        use(game, card, interaction.user.id);
        if (playedCard.endsWith("-reverse")) {
            if (!game.settings.reverseAnything) return interaction.editReply({ content: t("strings:game.forceDraw.noReverse", { lng }), embeds: [], components: [] });
            if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.editReply({
                content: t("strings:game.notPlayable", { lng }),
                embeds: [],
                components: []
            });
            game.currentCard = playedCard as unoCard;
            game.players = game.players.reverse();
            game.turnProgress = "chooseCard";
            game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
            if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
            if (game.players.length > 2) game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer), 2);
            toAppend += t("strings:game.forceDraw.reverse.reverseMessage", { lng, stack: game.drawStack, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer))) });
            game.drawStack = 0;
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else if (playedCard === "draw") {
            game.cards[game.currentPlayer] = game.cards[game.currentPlayer].concat(draw(game.cardsQuota, game.drawStack));
            if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
            toAppend += t("strings:game.forceDraw.draw", { name: await getUsername(client, game.guildId, game.currentPlayer), stack: game.drawStack, lng });
            game.drawStack = 0;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
            game.canSkip = true;
            endTurn(client, game, interaction, interaction.user.id, "misc", toAppend);
        } else if (card === "+4") {
            if (!game.settings.allowStacking) return interaction.editReply({ content: t("strings:game.forceDraw.noStacking", { lng }), embeds: [], components: [] });
            if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.editReply({
                content: t("strings:game.notPlayable", { lng }),
                embeds: [],
                components: []
            });
            game.turnProgress = "chooseColor";
            game.playedCard = card as typeof uniqueVariants[number];
            return interaction.editReply({
                ...chooseColor(card as typeof uniqueVariants[number], game.locale) as InteractionUpdateOptions
            });
        }
        else if (card.endsWith("-+2")) {
            if (!game.settings.allowStacking) return interaction.editReply({ content: t("strings:game.forceDraw.noStacking", { lng }), embeds: [], components: [] });
            if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.editReply({
                content: t("strings:game.notPlayable", { lng }),
                embeds: [],
                components: []
            });
            game.currentCard = playedCard as unoCard;
            if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-+2") || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c === card.split("-")[0] + "-reverse"))) {
                game.drawStack += 2;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            }
            else {
                game.drawStack += 2;
                toAppend = t("strings:game.forceDraw.draw", { name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer))), lng, stack: game.drawStack });
                if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
                game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
                game.turnProgress = "chooseCard";
                game.drawStack = 0;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id), 2);
            }
            endTurn(client, game, interaction, interaction.user.id, "misc", toAppend);
        }
    }
};
