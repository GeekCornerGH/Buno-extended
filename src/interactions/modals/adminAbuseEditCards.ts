import { modal } from "../../../typings/modal.js";
import { ModalsIDs } from "../../utils/constants.js";

export const m: modal = {
    name: ModalsIDs.ADMIN_ABUSE_EDIT_CARDS,
    execute: async (client, interaction) => {
        const target = interaction.customId.split("_")[1];
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
        else if (!game.cards[target]) return interaction.reply({
            content: "The user isn't in this game",
            ephemeral: true
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
            ephemeral: true
        });
        else if (input.split("\n").length < 3 && game.cards[target].length > 3) return interaction.reply({
            content: "You can't give the target less than 3 cards",
            ephemeral: true
        });
        else if (game.cards[target].length < 3 && input.split("\n").length !== game.cards[target].length) return interaction.reply({
            content: "You need to give the target the same numbers of cards they had before, if they only have 2 cards or less.",
            ephemeral: true
        });
        await interaction.deferUpdate();
        game.cards[target] = input.split("\n");
        await interaction.deleteReply();
    }
};
