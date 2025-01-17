import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { config } from "../../utils/config.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.DELETE_GAME,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (game.state !== "waiting") return interaction.reply({
            content: t("strings:errors.inProgress", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (interaction.user.id !== game.hostId && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.forbidden", { lng }),
            flags: MessageFlags.Ephemeral
        });
        client.games.splice(client.games.findIndex(g => g === game), 1);
        return interaction.update({ content: t("strings:game.cancelled", { lng, name: interaction.user.toString() }), embeds: [], components: [] });
    }
};
