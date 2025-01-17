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
            ephemeral: true
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            ephemeral: true
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            ephemeral: true
        });
        if (game.cards[game.currentPlayer].length !== 2) return interaction.reply({
            content: t("strings:game.buno.yell.notEnough", { lng }),
            ephemeral: true
        });
        if (game.unoPlayers.includes(interaction.user.id)) return interaction.reply({
            content: t("game.buno.yell.already", { lng }),
            ephemeral: true
        });
        await interaction.deferUpdate();
        game.unoPlayers.push(interaction.user.id);
        endTurn(client, game, interaction, interaction.user.id, "misc", t("game.buno.yell.message", { name: await getUsername(client, game.guildId, interaction.user.id), lng, yell: `BUN${"O".repeat(getRandomInt(1, 5))} O${"U".repeat(getRandomInt(1, 5))}T` }), false);
    }
};
