import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import { stringSelect } from "../../typings/stringSelect.js";
import { SelectIDs } from "../../utils/constants.js";

export const s: stringSelect = {
    name: SelectIDs.ADMIN_ABUSE_SWAP_CARDS_FROM,
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
        const target = interaction.values[0];
        await interaction.deferUpdate();
        return interaction.editReply({
            content: "Select the target player to exchange cards with.",
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                    .setComponents([
                        new StringSelectMenuBuilder()
                            .setCustomId(SelectIDs.ADMIN_ABUSE_SWAP_CARDS_TO + "_" + target)
                            .setMaxValues(1)
                            .setMinValues(0)
                            .setPlaceholder("Pick a player")
                            .setOptions(game.players.filter(p => p !== target).map(p => new StringSelectMenuOptionBuilder().setLabel(interaction.guild.members.cache.get(p).displayName).setValue(p)))
                    ])
            ]
        });
    }
};
