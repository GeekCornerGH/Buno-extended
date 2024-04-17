import { GuildMember, InteractionUpdateOptions } from "discord.js";

import chooseColor from "../../components/chooseColor.js";
import pickPlayer from "../../components/pickPlayer.js";
import playCard from "../../components/playCard.js";
import { stringSelect } from "../../typings/stringSelect.js";
import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { colors, maxDrawAsSabotage, SelectIDs, uniqueVariants, variants } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import use from "../../utils/game/use.js";

export const s: stringSelect = {
    name: SelectIDs.CHOOSE_CARD,
    execute: async (client, interaction) => {
        const card = interaction.values[0] as unoCard | typeof uniqueVariants[number] | "draw" | "skip";
        const game = client.games.find(g => g.channelId === interaction.channelId) as runningUnoGame;
        const { currentCard } = game;
        const index = game.cards[interaction.user.id].findIndex(c => c === card);
        const [color, type] = card.split("-") as [typeof color[number], typeof variants[number]];
        await interaction.deferUpdate();
        if (!game) return interaction.editReply({
            content: "Cannot find the game you're talking about.",
            components: [],
        });
        if (game.currentPlayer !== interaction.user.id) {
            return interaction.editReply({
                content: "It's not your turn",
                components: []
            });
        }
        if (game.drawStack > 0) {
            interaction.channel.send(`**${(interaction.member as GuildMember).displayName}** tried to avoid drawing cards :clown:`);
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        const playableCards = game.cards[interaction.user.id].filter(c => uniqueVariants.includes(c as typeof uniqueVariants[number]) || c.startsWith(currentCard.split("-")[0]) || c.endsWith(currentCard.split("-")[1]));
        playableCards.push("draw");
        if (game.canSkip) playableCards.push("skip");
        if (!playableCards.includes(card)) return interaction.editReply({
            content: "You can't play this card.",
            components: []
        });
        let toAppend: string = "";
        if (card === "draw") {
            if (game.saboteurs[interaction.user.id] && game.saboteurs[interaction.user.id] >= maxDrawAsSabotage) {
                game.players.splice(game.players.findIndex(p => p === interaction.user.id), 1);
                game.playersWhoLeft.push(interaction.user.id);
                const toAppend = `**${(interaction.member as GuildMember).displayName}** has been removed for attempting to sabotage the game`;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
                return endTurn(client, game, interaction, game.currentPlayer, "misc", toAppend, false);
            }
            if ((game.cards[interaction.user.id].filter(c => uniqueVariants.includes(c as typeof uniqueVariants[number]) || c.startsWith(game.currentCard.split("-")[0]) || c.endsWith(game.currentCard.split("-")[1])))[0]) {
                if (game.saboteurs[interaction.user.id]) game.saboteurs[interaction.user.id] += 1;
                else game.saboteurs[interaction.user.id] = 1;
            }
            else if (game.saboteurs[interaction.user.id] && game.saboteurs[interaction.user.id] > 0) game.saboteurs[interaction.user.id] -= 1;
            const newCard = draw(game.cardsQuota, 1)[0];
            game.cards[interaction.user.id].push(newCard);
            if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
            if (!game.settings.allowSkipping) {
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
                return endTurn(client, game, interaction, interaction.user.id, "misc", `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** drew a card`, false);
            }
            else {
                game.canSkip = true;
                const toSend = playCard(client, interaction, game, interaction.user.id, game.canSkip, newCard);
                interaction.channel.send(`**${interaction.guild.members.cache.get(interaction.user.id).displayName}** drew a card.`);
                if (Object.keys(toSend).length === 0) return;
                return await interaction.editReply({ ...toSend });
            }
        }
        else if (card === "skip") {
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            return endTurn(client, game, interaction, interaction.user.id, "misc", `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** skipped their turn.`, false);
        }
        if (index < 0) {
            interaction.channel.send(`**${(interaction.member as GuildMember).displayName}** tried to play a non-existant card :clown:`);
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        use(game, card as unoCard, interaction.user.id);
        if (uniqueVariants.includes(card as typeof uniqueVariants[number])) {
            game.turnProgress = "chooseColor";
            game.playedCard = card as typeof uniqueVariants[number];
            return interaction.editReply({
                ...chooseColor(card as typeof uniqueVariants[number]) as InteractionUpdateOptions
            });
        }
        if (type === "reverse") {
            game.currentCard = card;
            game.players = game.players.reverse();
            if (game.players.length <= 2) toAppend = `**${(client.guilds.cache.get(game.guildId).members.cache.get(next(game.players, game.players.findIndex(p => p === game.currentPlayer))) as GuildMember).displayName}** has been skipped.`;
            else {
                toAppend = "The player order has been reversed.";
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
            }
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else if (type === "block") {
            game.currentCard = card;
            toAppend = toAppend = `**${(client.guilds.cache.get(game.guildId).members.cache.get(next(game.players, game.players.findIndex(p => p === game.currentPlayer))) as GuildMember).displayName}** has been skipped.`;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id), 2);
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else if (type === "+2") {
            game.currentCard = card;
            if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-+2") || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c === color + "-reverse"))) {
                game.drawStack += 2;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
                endTurn(client, game, interaction, interaction.user.id, "played");
            }
            else {
                game.drawStack += 2;
                toAppend = `**${(client.guilds.cache.get(game.guildId).members.cache.get(next(game.players, game.players.findIndex(p => p === game.currentPlayer))) as GuildMember).displayName}** drew ${game.drawStack} cards and has been skipped.`;
                if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
                game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
                game.turnProgress = "chooseCard";
                game.drawStack = 0;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id), 2);
                endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
            }
        }
        else if (game.settings.sevenAndZero && ["7", "0"].includes(type)) {
            if (type === "7") {
                game.turnProgress = "pickPlayer";
                game.playedCard = card as `${typeof colors[number]}-7`;
                return interaction.editReply({ ...pickPlayer(client, game, interaction.user.id) });
            }
            else if (type === "0") {
                game.currentCard = card;
                toAppend += "All the players' cards have been swapped!";
                const keys = Object.keys(game.cards);
                keys.unshift(keys.pop());
                if (game.settings.shouldYellBUNO) {
                    for (let i = 0; i < keys.length; i++) {
                        if (game.unoPlayers.includes(keys[i])) {
                            game.unoPlayers.splice(game.unoPlayers.indexOf(keys[i]), 1);
                            game.unoPlayers.push(keys[(i + 1) % keys.length]);
                        }
                    }
                }
                const numPlayers = keys.length;
                const newCards = {};
                for (let i = 0; i < numPlayers; i++) {
                    const currentPlayerKey = keys[i];
                    const nextPlayerKey = keys[(i + 1) % numPlayers];

                    // Assign next player's cards to current player
                    newCards[currentPlayerKey] = game.cards[nextPlayerKey];
                }
                game.cards = newCards;
            }
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else {
            game.currentCard = card;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            endTurn(client, game, interaction, interaction.user.id, "played");
        }
    }
};
