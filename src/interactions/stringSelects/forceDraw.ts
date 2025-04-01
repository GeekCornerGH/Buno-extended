
import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { stringSelect } from "../../typings/stringSelect.js";
import { unoCard } from "../../typings/unoGame.js";
import { SelectIDs, uniqueVariants } from "../../utils/constants.js";
import forceDrawLogic from "../../utils/game/forceDrawLogic.js";

export const s: stringSelect = {
    name: SelectIDs.FORCEFUL_DRAW,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        const card = interaction.values[0] as unoCard | typeof uniqueVariants[number] | "draw";

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
        if (game.drawStack === 0) return interaction.reply({
            content: t("strings:errors.noDrawStack", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (!card) return interaction.reply({
            content: t("strings:game.forceDraw.playACard", { lng }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        return forceDrawLogic(game, card, interaction.user.id, client, interaction);
    }
};
