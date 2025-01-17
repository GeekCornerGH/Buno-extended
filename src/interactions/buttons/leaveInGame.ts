import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.LEAVE_GAME,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notInGame", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        return interaction.reply({
            components: [new ActionRowBuilder<ButtonBuilder>().setComponents([
                new ButtonBuilder().setStyle(ButtonStyle.Danger).setEmoji("🚪").setCustomId(ButtonIDs.LEAVE_GAME_CONFIRMATION_YES).setLabel("Yes")
            ])],
            content: t("strings:leave.prompt", { lng }),
            flags: MessageFlags.Ephemeral
        });
    }
};
