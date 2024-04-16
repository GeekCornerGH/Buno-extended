import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { ButtonIDs } from "../utils/constants";

export default () => {
    return new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
            new ButtonBuilder()
                .setCustomId(ButtonIDs.ADMINABUSE_PANEL)
                .setEmoji("🏠")
                .setLabel("Back to admin abuse panel home")
                .setStyle(ButtonStyle.Primary)
        );
};
