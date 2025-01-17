
import { InteractionReplyOptions, MessageFlags } from "discord.js";
import { t } from "i18next";

import editSettings from "../../components/editSettings.js";
import { Buno } from "../../database/models/buno.js";
import { button } from "../../typings/button.js";
import { config } from "../../utils/config.js";
import { ButtonIDs, defaultSettings } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.EDIT_GAME_SETTINGS,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notTheHost", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const req = await Buno.findOne({
            where: {
                guildId: interaction.guild?.id,
                userId: game.hostId
            }
        });
        game.settings = { ...defaultSettings, ...req?.getDataValue("settings") };
        interaction.reply({ flags: MessageFlags.Ephemeral, ...await editSettings(game) as InteractionReplyOptions });
    }
};
