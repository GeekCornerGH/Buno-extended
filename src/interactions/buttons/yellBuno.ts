import { button } from "../../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import endTurn from "../../utils/game/endTurn.js";
import getRandomInt from "../../utils/getRandomInt.js";

export const b: button = {
    name: ButtonIDs.SHOUT_UNO,
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
        if (game.cards[game.currentPlayer].length !== 2) return interaction.reply({
            content: "You can only yell \"Buno out!\" when you have 2 cards.",
            ephemeral: true
        });
        if (game.unoPlayers.includes(interaction.user.id)) return interaction.reply({
            content: "You yelled \"Buno Out!\" before.",
            ephemeral: true
        });
        await interaction.deferUpdate();
        game.unoPlayers.push(interaction.user.id);
        endTurn(client, game, interaction, interaction.user.id, "misc", `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** yelled\n# BUN${"O".repeat(getRandomInt(1, 5))} O${"U".repeat(getRandomInt(1, 5))}T!`, false);
    }
};
