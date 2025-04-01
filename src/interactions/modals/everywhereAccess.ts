
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, MessageFlags, TextChannel } from "discord.js";
import { t } from "i18next";

import { everywhereAccess, state } from "../../database/models/everywhereAccess.js";
import { modal } from "../../typings/modal.js";
import { config } from "../../utils/config.js";
import { ButtonIDs, ModalsIDs } from "../../utils/constants.js";

export const m: modal = {
    name: ModalsIDs.BUNO_EVERYWHERE_ACCESS,
    execute: async (client, interaction) => {
        const lng = interaction.locale.split("-")[0];
        const hasEverywhereAccess = await everywhereAccess.findOne({
            where: {
                userId: interaction.user.id,
            }
        });
        if (hasEverywhereAccess && hasEverywhereAccess.getDataValue("status") === state.accepted) return interaction.reply({
            content: t("strings:access.modal.preapproved", { lng }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        await everywhereAccess.create({
            userId: interaction.user.id,
            status: state.pending
        });
        await (interaction.client.channels.cache.get(config.approvalChannel as string) as TextChannel).send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle("Buno Everywhere request")
                    .addFields([{ name: "User infos", value: `${interaction.user.toString()} (${interaction.user.username}) would like to have access to Buno Everywhere.` }])
                    .setDescription(interaction.fields.getTextInputValue(ModalsIDs.BUNO_EVERYWHERE_ACCESS_QUESTION))
            ],
            content: config.developerIds.map(d => `<@${d}>`).join(" "),
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([
                        new ButtonBuilder()
                            .setLabel("Approve")
                            .setStyle(ButtonStyle.Success)
                            .setCustomId(ButtonIDs.APPROVE_ACCESS + "_" + interaction.user.id),
                        new ButtonBuilder()
                            .setLabel("Deny")
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(ButtonIDs.DENY_ACCESS + "_" + interaction.user.id)
                    ])
            ]
        });
        await interaction.editReply({
            content: t("strings:access.modal.received", { lng }),
            embeds: [],
            components: []
        });

    }
};
