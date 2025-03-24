import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import endTurn from "../../utils/game/endTurn.js";
import getRandomInt from "../../utils/getRandomInt.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.SHOUT_UNO,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.cards[game.currentPlayer].length !== 2) return interaction.reply({
            content: t("strings:game.buno.yell.notEnough", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.unoPlayers.includes(interaction.user.id)) return interaction.reply({
            content: t("game.buno.yell.already", { lng }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        game.unoPlayers.push(interaction.user.id);
        endTurn(client, game, interaction, interaction.user.id, "misc", t("game.buno.yell.message", { name: await getUsername(client, game.guildId, interaction.user.id, !game.guildApp), lng, yell: `BUN${"O".repeat(getRandomInt(1, 5))} O${"U".repeat(getRandomInt(1, 5))}T` }), false);
    }
};
