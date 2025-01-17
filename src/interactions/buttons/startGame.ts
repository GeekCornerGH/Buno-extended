import { t } from "i18next";

import { button } from "../../typings/button.js";
import { config } from "../../utils/config.js";
import { ButtonIDs } from "../../utils/constants.js";
import startGame from "../../utils/game/startGame.js";

export const b: button = {
    name: ButtonIDs.START_GAME,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.guildId === interaction.guildId && g.messageId === interaction.message.id);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            ephemeral: true,
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notTheHost", { lng }),
            ephemeral: true
        });
        if (game.players.length < 2 && game._modified !== true) return interaction.reply({
            ephemeral: true,
            content: t("strings:errors.alone", { lng })
        });
        startGame(client, game, false, interaction.message);
        interaction.deferReply({ ephemeral: true });
        interaction.deleteReply();
    }
};
