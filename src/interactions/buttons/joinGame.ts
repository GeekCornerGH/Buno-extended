import { EmbedBuilder, GuildMember, InteractionUpdateOptions } from "discord.js";

import { button } from "../../../typings/button";
import lobbyGameMessage from "../../components/lobbyGameMessage.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.JOIN_GAME,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        if (!game) return interaction.reply({
            content: "No game is currently running.",
            ephemeral: true
        });
        if (game.state === "inProgress") return interaction.reply({
            content: "The game is already running.",
            ephemeral: true
        });
        if (game.players.includes(interaction.user.id)) return interaction.reply({
            content: "You're already in the game!",
            ephemeral: true
        });
        if (game.players.length >= 12) return interaction.reply({
            content: "The game reached its maximum capacity",
            ephemeral: true
        });
        game.players.push((interaction.member as GuildMember).id);
        await interaction.update(await lobbyGameMessage(game, interaction.guild) as InteractionUpdateOptions);
        const now = new Date();
        if (now.getMonth() === 3 && now.getDate() === 1) return interaction.followUp({
            embeds: [new EmbedBuilder()
                .setImage("https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif")
                .setTitle("Happy april fools!")
                .setTimestamp()
                .setColor("Red")],
            ephemeral: true
        });
    }
};
