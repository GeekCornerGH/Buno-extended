import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js";

import { everywhereAccess, state } from "../../database/models/everywhereAccess.js";
import { button } from "../../typings/button.js";
import { config } from "../../utils/config.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.APPROVE_ACCESS,
    execute: async (client, interaction) => {
        if (!config.developerIds.includes(interaction.user.id)) return;
        await interaction.deferUpdate();
        await everywhereAccess.update({
            status: state.accepted
        }, {
            where: {
                userId: interaction.customId.split("_")[1]
            }
        });
        return await interaction.editReply({
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents(new ButtonBuilder()
                        .setLabel("Revoke access")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId(ButtonIDs.DENY_ACCESS + "_" + interaction.user.id))
            ],
            embeds: [
                EmbedBuilder.from(interaction.message.embeds[0]).setColor(Colors.Green).setTitle("Access granted")
            ]
        });
    }
};
