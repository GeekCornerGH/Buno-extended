
import { InteractionReplyOptions } from "discord.js";

import editSettings from "../../components/editSettings.js";
import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.VIEW_GAME_SETTINGS,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        if (!game) return interaction.reply({
            content: "No game is currently running.",
            ephemeral: true,
        });
        interaction.reply({ ephemeral: true, ...await editSettings(game) as InteractionReplyOptions, components: [] });
    }
};
