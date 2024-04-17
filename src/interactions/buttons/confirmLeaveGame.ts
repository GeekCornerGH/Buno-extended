
import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import onTimeout from "../../utils/game/onTimeout.js";
import timeouts from "../../utils/timeoutManager.js";

export const b: button = {
    name: ButtonIDs.LEAVE_GAME_CONFIRMATION_YES,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!game) return interaction.reply({
            content: "No game is currently running.",
            ephemeral: true,
        });
        if (game.state !== "inProgress") return interaction.reply({
            content: "You can't leave the game using that button.",
            ephemeral: true,
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: "You're not part of the game.",
            ephemeral: true,
        });
        await interaction.deferUpdate();
        const index = game.players.findIndex(p => p === interaction.user.id);
        const holder = game.currentPlayer;
        if (game.currentPlayer === interaction.user.id) game.currentPlayer = game.players[next(game.players, index)];
        game.players.splice(index, 1);
        await interaction.deleteReply();
        timeouts.delete(game.channelId);
        timeouts.set(game.channelId, () => onTimeout(client, game, game.currentPlayer), game.settings.timeoutDuration * 1000);
        await interaction.channel.messages.cache.get(game.messageId).delete();
        await interaction.channel.send(`**${interaction.guild.members.cache.get(interaction.user.id).displayName}** has left the game.`);
        endTurn(client, game, interaction, holder, "misc", undefined, false);
    }
};
