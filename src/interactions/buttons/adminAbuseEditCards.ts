import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import backToAdminAbuseHome from "../../components/backToAdminAbuseHome.js";
import { button } from "../../typings/button.js";
import { ButtonIDs, SelectIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.ADMIN_ABUSE_EDIT_CARDS,
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
        const embed = new EmbedBuilder()
            .setTitle("Edit the cards of a player")
            .setDescription("You can't:\n- remove cards to have less than 3");
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([new StringSelectMenuBuilder()
            .setCustomId(SelectIDs.ADMIN_ABUSE_PLAYER_CARDS_EDIT)
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Select a player here")
            .setOptions(game.players.map(p => new StringSelectMenuOptionBuilder()
                .setLabel(interaction.guild.members.cache.get(p).displayName)
                .setValue(p)
            ))
        ]);
        await interaction.editReply({ embeds: [embed], components: [row, backToAdminAbuseHome()] });
    }
};
