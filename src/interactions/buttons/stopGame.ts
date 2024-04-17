import { button } from "../../../typings/button.js";
import { config } from "../../utils/config.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.DELETE_GAME,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        if (!game) return interaction.reply({
            content: "Couldn't find the game you're talking about.",
            ephemeral: true
        });
        if (game.state !== "waiting") return interaction.reply({
            content: "The game is in progress",
            ephemeral: true
        });
        if (interaction.user.id !== game.hostId && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: "You are not allowed to stop the game.",
            ephemeral: true
        });
        client.games.splice(client.games.findIndex(g => g === game), 1);
        return interaction.update({ content: "Game has been cancelled by " + interaction.user.toString(), embeds: [], components: [] });
    }
};
