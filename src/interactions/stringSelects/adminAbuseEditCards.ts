import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

import { stringSelect } from "../../typings/stringSelect.js";
import { ModalsIDs, SelectIDs } from "../../utils/constants.js";

export const s: stringSelect = {
    name: SelectIDs.ADMIN_ABUSE_PLAYER_CARDS_EDIT,
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
        else if (!game.cards[interaction.values[0]]) return interaction.reply({
            content: "The user isn't in this game",
            ephemeral: true
        });
        game.adminAbused = true;
        await interaction.showModal(new ModalBuilder()
            .setCustomId(ModalsIDs.ADMIN_ABUSE_EDIT_CARDS + "_" + interaction.values[0])
            .setTitle(`Edit ${interaction.guild.members.cache.get(interaction.values[0]).displayName}'s cards`)
            .setComponents([
                new ActionRowBuilder<TextInputBuilder>()
                    .setComponents([
                        new TextInputBuilder()
                            .setCustomId(ModalsIDs.ADMIN_ABUSE_EDIT_CARDS_FIELD)
                            .setLabel("Cards")
                            .setMinLength(2)
                            .setRequired(true)
                            .setValue(game.cards[interaction.values[0]].join("\n"))
                            .setStyle(TextInputStyle.Paragraph)
                    ])
            ])
        );
    }
};
