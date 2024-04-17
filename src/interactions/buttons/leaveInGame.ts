import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.LEAVE_GAME,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        if (!game) return interaction.reply({
            content: "No game is currently running.",
            ephemeral: true,
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: "You're not part of the game.",
            ephemeral: true,
        });
        return interaction.reply({
            components: [new ActionRowBuilder<ButtonBuilder>().setComponents([
                new ButtonBuilder().setStyle(ButtonStyle.Danger).setEmoji("🚪").setCustomId(ButtonIDs.LEAVE_GAME_CONFIRMATION_YES).setLabel("Yes")
            ])],
            content: "Are you sure you want to leave the game? You won't be able to rejoin the game again.",
            ephemeral: true
        });
    }
};
