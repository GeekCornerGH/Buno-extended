import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { stringSelect } from "../../typings/stringSelect.js";
import { SelectIDs } from "../../utils/constants.js";

export const s: stringSelect = {
    name: SelectIDs.ADMIN_ABUSE_SWAP_CARDS_TO,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
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
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            flags: MessageFlags.Ephemeral
        });
        const targetFrom = interaction.customId.split("_")[1];
        const targetTo = interaction.values[0];
        await interaction.deferUpdate();
        const tempHolder = game.cards[targetFrom];
        game.cards[targetFrom] = game.cards[targetTo];
        game.cards[targetTo] = tempHolder;
        game.adminAbused = true;
        await interaction.deleteReply();
    }
};
