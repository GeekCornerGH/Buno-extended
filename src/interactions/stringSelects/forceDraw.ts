
import { GuildMember, InteractionUpdateOptions } from "discord.js";

import { stringSelect } from "../../../typings/stringSelect";
import { runningUnoGame, unoCard } from "../../../typings/unoGame";
import chooseColor from "../../components/chooseColor";
import { SelectIDs, uniqueVariants } from "../../utils/constants";
import draw from "../../utils/game/draw";
import endTurn from "../../utils/game/endTurn";
import next from "../../utils/game/next";
import playableCard from "../../utils/game/playableCard";
import use from "../../utils/game/use";

export const s: stringSelect = {
    name: SelectIDs.FORCEFUL_DRAW,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId) as runningUnoGame;
        const card = interaction.values[0] as unoCard | typeof uniqueVariants[number];

        if (!game) return interaction.reply({
            content: "Couldn't find the game you're talking about",
            ephemeral: true
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: "It's not your turn",
            ephemeral: true
        });
        if (game.drawStack === 0) return interaction.reply({
            content: "So... you want to draw cards while there's no cards to draw? Interesting...",
            ephemeral: true
        });
        const playedCard = interaction.values[0] as unoCard | "draw";
        if (!playedCard) return interaction.reply({
            content: "Please play a card",
            ephemeral: true
        });
        const filtered = playableCard(game.cards[interaction.user.id] as unoCard[], game.currentCard).filter(c => (game.settings.allowStacking && (c === "+4" || c.endsWith("-+2")) || (game.settings.reverseAnything && (c.endsWith("-reverse")))));
        if (!filtered) return interaction.reply({
            content: "You don't have any card to play",
            ephemeral: true
        });
        const pushedFiltered = [...filtered, "draw"];
        if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.reply({
            content: "You can't play this card.",
            ephemeral: true
        });
        await interaction.deferUpdate();
        let toAppend = "";
        use(game, card, interaction.user.id);
        if (playedCard.endsWith("-reverse")) {
            if (!game.settings.reverseAnything) return interaction.editReply({ content: "The Reverse Card rule is disabled", embeds: [], components: [] });
            if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.editReply({
                content: "You can't play this card.",
                embeds: [],
                components: []
            });
            if (!game.settings.reverseAnything) return interaction.editReply({
                content: "The reverse card rule isn't enabled",
            });
            game.currentCard = playedCard as unoCard;
            game.players = game.players.reverse();
            game.turnProgress = "chooseCard";
            game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
            if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
            if (game.players.length > 2) game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer), 2);
            game.drawStack = 0;
            toAppend += `**${interaction.guild.members.cache.get(next(game.players, game.players.findIndex(p => p === interaction.user.id))).displayName}** drew ${game.drawStack} cards and has been skipped, thanks to the reverse card power.`;
            toAppend += "\nThe player order has been reversed.";
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else if (playedCard === "draw") {
            game.cards[game.currentPlayer] = game.cards[game.currentPlayer].concat(draw(game.cardsQuota, game.drawStack));
            if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
            toAppend += `**${interaction.guild.members.cache.get(game.currentPlayer).displayName}** drew ${game.drawStack}.`;
            game.drawStack = 0;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
            game.canSkip = true;
            endTurn(client, game, interaction, interaction.user.id, "misc", toAppend);
        } else if (card === "+4") {
            if (!game.settings.allowStacking) return interaction.editReply({ content: "The Allow Stacking rule is disabled", embeds: [], components: [] });
            if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.editReply({
                content: "You can't play this card.",
                embeds: [],
                components: []
            });
            game.turnProgress = "chooseColor";
            game.playedCard = card as typeof uniqueVariants[number];
            return interaction.editReply({
                ...chooseColor(card as typeof uniqueVariants[number]) as InteractionUpdateOptions
            });
        }
        else if (card.endsWith("-+2")) {
            if (!game.settings.allowStacking) return interaction.editReply({ content: "The Allow Stacking rule is disabled", embeds: [], components: [] });
            if (!pushedFiltered.includes(playedCard as unoCard)) return interaction.editReply({
                content: "You can't play this card.",
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
                toAppend = `**${(client.guilds.cache.get(game.guildId).members.cache.get(next(game.players, game.players.findIndex(p => p === game.currentPlayer))) as GuildMember).displayName}** drew ${game.drawStack} cards and has been skipped.`;
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
