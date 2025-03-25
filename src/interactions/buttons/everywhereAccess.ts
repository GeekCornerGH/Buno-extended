import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs, ModalsIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.REQUEST_ACCESS,
    execute: (client, interaction) => {
        const lng = interaction.locale.split("-")[0];
        return interaction.showModal(new ModalBuilder()
            .setComponents([
                new ActionRowBuilder<TextInputBuilder>()
                    .setComponents([new TextInputBuilder()
                        .setStyle(TextInputStyle.Paragraph)
                        .setLabel(t("strings:access.modal.question.label", { lng }))
                        .setCustomId(ModalsIDs.BUNO_EVERYWHERE_ACCESS_QUESTION)
                        .setMinLength(32)
                        .setMaxLength(4000)
                        .setRequired(true)
                        .setPlaceholder("I'd like to have Buno Everywhere access because...")
                    ])
            ])
            .setTitle(t("strings:access.modal.title", { lng }))
            .setCustomId(ModalsIDs.BUNO_EVERYWHERE_ACCESS)
        );
    }
};
