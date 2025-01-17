import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { t } from "i18next";

import { stringSelect } from "../../typings/stringSelect.js";
import { ModalsIDs, SelectIDs } from "../../utils/constants.js";
import { getUsername } from "../../utils/getUsername.js";

export const s: stringSelect = {
    name: SelectIDs.ADMIN_ABUSE_PLAYER_CARDS_EDIT,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            ephemeral: true
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            ephemeral: true
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
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
            .setTitle(t("strings:game.aa.edit.modal.title", { lng, name: await getUsername(client, game.guildId, interaction.user.id) }))
            .setComponents([
                new ActionRowBuilder<TextInputBuilder>()
                    .setComponents([
                        new TextInputBuilder()
                            .setCustomId(ModalsIDs.ADMIN_ABUSE_EDIT_CARDS_FIELD)
                            .setLabel(t("game.aa.edit.modal.label", { lng }))
                            .setMinLength(2)
                            .setRequired(true)
                            .setValue(game.cards[interaction.values[0]].join("\n"))
                            .setStyle(TextInputStyle.Paragraph)
                    ])
            ])
        );
    }
};
