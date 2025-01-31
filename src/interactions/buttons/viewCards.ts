import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { config } from "../../utils/config.js";
import { ButtonIDs, cardEmojis, cardEmotes } from "../../utils/constants.js";
import toTitleCase from "../../utils/game/toTitleCase.js";

export const b: button = {
    name: ButtonIDs.VIEW_CARDS,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id) as runningUnoGame;
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notInGame", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        return interaction.reply({
            content: game.cards[interaction.user.id].map(card => {
                const c = card as unoCard;
                return `${config.emoteless ? `${cardEmotes[c]} ${toTitleCase(c, lng)}` : `${cardEmojis[c]}`}` as unoCard;
            }).filter(v => v !== undefined).join(config.emoteless ? ", " : " "),
            flags: MessageFlags.Ephemeral
        });

    }
};
