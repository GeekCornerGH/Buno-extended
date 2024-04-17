import { InteractionUpdateOptions } from "discord.js";

import lobbyGameMessage from "../../components/lobbyGameMessage.js";
import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.LEAVE_GAME_BEFORE_START,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        if (!game) return interaction.reply({
            content: "The game you're talking about was not found",
            ephemeral: true
        });
        if (game.state === "inProgress") return interaction.reply({
            content: "You can't leave the game using this button.",
            ephemeral: true
        });
        if (game.hostId === interaction.user.id) return interaction.reply({
            content: "You can't leave the game as host.",
            ephemeral: true
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: "You're not part of the game.",
            ephemeral: true,
        });
        game.players.splice(game.players.findIndex(p => p === interaction.user.id), 1);
        interaction.update({ ...await lobbyGameMessage(game, interaction.guild) as InteractionUpdateOptions });
    }
};
