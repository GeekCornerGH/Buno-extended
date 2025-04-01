import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { stringSelect } from "../../typings/stringSelect.js";
import { SelectIDs } from "../../utils/constants.js";
import { swapCards } from "../../utils/game/swapCards.js";

export const s: stringSelect = {
    name: SelectIDs.PLAYER_USER_SELECT,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        await interaction.deferUpdate();
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.currentPlayer !== interaction.user.id) {
            return interaction.editReply({
                content: t("strings:game.notYourTurn", { lng }),
                components: []
            });
        }
        const player = interaction.values[0];
        if (player === interaction.user.id) return interaction.editReply({
            content: "You can't give cards to yourself"
        });
        return swapCards(game, player, interaction, client);
    }
};
