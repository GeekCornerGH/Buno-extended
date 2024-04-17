import { button } from "../../../typings/button";
import { runningUnoGame } from "../../../typings/unoGame.js";
import { ButtonIDs } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";

export const b: button = {
    name: ButtonIDs.JOIN_MID_GAME,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id) as runningUnoGame;
        if (!game) return interaction.reply({
            content: "Unable to find the game you're talking about.",
            ephemeral: true
        });
        if (game.playersWhoLeft.includes(interaction.user.id)) return interaction.reply({
            content: "You can't join a game you left.",
            ephemeral: true,
        });
        if (game.players.includes(interaction.user.id)) return interaction.reply({
            content: "You're already in the game",
            ephemeral: true
        });
        if (game.players.length >= 12) return interaction.reply({
            content: "The game is already full.",
            ephemeral: true
        });
        await interaction.deferReply({
            ephemeral: true
        });
        game.players.push(interaction.user.id);
        game.cards[interaction.user.id] = draw(game.cardsQuota, Math.ceil((Object.keys(game.cards).map(p => game.cards[p].length).reduce((a, b) => a + b, 0)) / Object.keys(game.cards).length));
        await endTurn(client, game, interaction, game.currentPlayer, "misc", `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** has joined the game.`, false);
    }
};
