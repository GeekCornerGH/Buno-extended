import { stringSelect } from "../../typings/stringSelect.js";
import { runningUnoGame } from "../../typings/unoGame.js";
import { SelectIDs } from "../../utils/constants.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";

export const s: stringSelect = {
    name: SelectIDs.PLAYER_USER_SELECT,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId) as runningUnoGame;
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
        const player = interaction.values[0];
        if (player === interaction.user.id) return interaction.editReply({
            content: "You can't give cards to yourself"
        });
        const tempHolder = game.cards[interaction.user.id];
        game.cards[interaction.user.id] = game.cards[player];
        game.cards[player] = tempHolder;
        game.currentCard = game.playedCard;
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
        game.turnProgress = "chooseCard";
        if (game.settings.shouldYellBUNO && game.unoPlayers.includes(interaction.user.id)) {
            game.unoPlayers.push(player);
            game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === interaction.user.id), 1);
        }
        if (game.settings.shouldYellBUNO && game.unoPlayers.includes(player)) {
            game.unoPlayers.push(interaction.user.id);
            game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === player), 1);
        }
        endTurn(client, game, interaction, interaction.user.id, "played", `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** exchanged cards with **${interaction.guild.members.cache.get(player).displayName}**`);
    }
};
