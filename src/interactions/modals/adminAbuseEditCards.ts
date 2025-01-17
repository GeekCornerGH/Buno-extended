import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { modal } from "../../typings/modal.js";
import { unoCard } from "../../typings/unoGame.js";
import { ModalsIDs } from "../../utils/constants.js";

export const m: modal = {
    name: ModalsIDs.ADMIN_ABUSE_EDIT_CARDS,
    execute: async (client, interaction) => {
        const target = interaction.customId.split("_")[1];
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
        else if (!game.cards[target]) return interaction.reply({
            content: "The user isn't in this game",
            flags: MessageFlags.Ephemeral
        });
        let notMatched = null;
        const input = interaction.fields.getTextInputValue(ModalsIDs.ADMIN_ABUSE_EDIT_CARDS_FIELD);
        const regex = new RegExp(/\b(red|yellow|green|blue)-(0|\+2|reverse|block|[1-9])\b|\bwild\b|\+\b4\b/);
        for (const value of input.split("\n")) {
            if (notMatched) return;
            if (!value.trim().match(regex)) notMatched = value.trim();
        }
        if (notMatched) return interaction.reply({
            content: `The ${notMatched} value is not a valid card.`,
            flags: MessageFlags.Ephemeral
        });
        else if (input.split("\n").length < 3 && game.cards[target].length > 3) return interaction.reply({
            content: "You can't give the target less than 3 cards",
            flags: MessageFlags.Ephemeral
        });
        else if (game.cards[target].length < 3 && input.split("\n").length !== game.cards[target].length) return interaction.reply({
            content: "You need to give the target the same numbers of cards they had before, if they only have 2 cards or less.",
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        game.cards[target] = input.split("\n") as unoCard[];
        await interaction.deleteReply();
    }
};
