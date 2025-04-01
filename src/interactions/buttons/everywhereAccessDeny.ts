
import { everywhereAccess } from "../../database/models/everywhereAccess.js";
import { button } from "../../typings/button.js";
import { config } from "../../utils/config.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.DENY_ACCESS,
    execute: async (client, interaction) => {
        if (!config.developerIds.includes(interaction.user.id)) return;
        await interaction.deferUpdate();
        await everywhereAccess.destroy({
            where: {
                userId: interaction.customId.split("_")[1]
            }
        });
        return await interaction.deleteReply();
    }
};
