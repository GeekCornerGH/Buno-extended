import { EmbedBuilder } from "discord.js";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.DISABLED_BUTTON,
    execute: (client, interaction) => {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Get rickrolled lol")
                    .setColor("Random")
                    .setImage("https://tenor.com/view/22954713.gif")
                    .setTimestamp()
            ],
            ephemeral: true
        });
    }
};
