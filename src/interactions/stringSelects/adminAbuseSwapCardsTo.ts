import { stringSelect } from "../../../typings/stringSelect";
import { SelectIDs } from "../../utils/constants";

export const s: stringSelect = {
    name: SelectIDs.ADMIN_ABUSE_SWAP_CARDS_TO,
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
