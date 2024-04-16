import { EmbedBuilder } from "discord.js";

import { button } from "../../../typings/button";
import { ButtonIDs } from "../../utils/constants";

export const b: button = {
    name: ButtonIDs.DISABLED_BUTTON,
    execute: (client, interaction) => {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Get rickrolled, you curious")
                    .setColor("Random")
                    .setImage("https://tenor.com/view/22954713.gif")
                    .setTimestamp()
            ],
            ephemeral: true
        });
    }
};
