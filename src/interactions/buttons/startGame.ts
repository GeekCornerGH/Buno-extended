import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { config } from "../../utils/config.js";
import { ButtonIDs } from "../../utils/constants.js";
import startGame from "../../utils/game/startGame.js";

export const b: button = {
    name: ButtonIDs.START_GAME,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.guildId === interaction.guildId && g.messageId === interaction.message.id);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notTheHost", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.players.length < 2 && game._modified !== true) return interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: t("strings:errors.alone", { lng })
        });
        if (game.guildApp) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        else await interaction.deferUpdate();
        await startGame(client, game, false, interaction.message);
        if (game.guildApp) interaction.deleteReply();
    }
};
