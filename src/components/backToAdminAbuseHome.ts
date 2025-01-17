import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { t } from "i18next";

import { ButtonIDs } from "../utils/constants.js";

export default (lng: string) => {
    return new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
            new ButtonBuilder()
                .setCustomId(ButtonIDs.ADMINABUSE_PANEL)
                .setEmoji("🏠")
                .setLabel(t("strings:game.aa.components.back", { lng }))
                .setStyle(ButtonStyle.Primary)
        );
};
