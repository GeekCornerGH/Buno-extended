import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import { button } from "../../../typings/button";
import { ButtonIDs, SelectIDs } from "../../utils/constants";

export const b: button = {
    name: ButtonIDs.ADMIN_ABUSE_SWAP_CARDS,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!game) return interaction.reply({
            content: "Cannot find the game you're talking about.",
            ephemeral: true
        });
        else if (game.state === "waiting") return interaction.reply({
            content: "The game hasn't started yet.",
            ephemeral: true
        });
        else if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: "This is not your turn.",
            ephemeral: true
        });
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        await interaction.deferUpdate();
        return await interaction.editReply({
            content: "Choose the player you want to swap cards from.",
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(SelectIDs.ADMIN_ABUSE_SWAP_CARDS_FROM)
                    .setPlaceholder("Pick a player")
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(game.players.map(p => {
                        return new StringSelectMenuOptionBuilder().setLabel(interaction.guild.members.cache.get(p).displayName).setValue(p);
                    }))
            ])]
        });
    }
};
