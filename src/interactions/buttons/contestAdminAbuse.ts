import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";

export const b: button = {
    name: ButtonIDs.CONTEST_ADMIN_ABUSE,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!game) return interaction.reply({
            content: "Cannot find the game you're talking about",
            ephemeral: true
        });
        if (game.state === "waiting") return interaction.reply({
            content: "The game isn't running yet.",
            ephemeral: true
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: "This is not your turn.",
            ephemeral: true
        });
        const prevTurn = game.log[game.log.length - 1];
        if (!prevTurn) return interaction.reply({
            content: "The game just started, you can't do this now.",
            ephemeral: true
        });
        if (prevTurn.player !== game.hostId) return interaction.reply({
            content: "Seriously? Are you trying to contest someone who's not the host?",
            ephemeral: true
        });
        await interaction.deferUpdate();
        if (!prevTurn.adminAbused) {
            game.cards[interaction.user.id] = game.cards[interaction.user.id].concat(draw(game.cardsQuota, 3));
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            endTurn(client, game, interaction, interaction.user.id, "misc", `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** contested admin abuse and failed. They drew 3 cards.`, false);
        }
        else {
            game.players.splice(game.players.findIndex(p => p === game.hostId), 1);
            await endTurn(client, game, interaction, interaction.user.id, "misc", `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** contested admin abuse and won. **${interaction.guild.members.cache.get(prevTurn.player).displayName}** has been ejected from the game.`);
        }
    }
};
