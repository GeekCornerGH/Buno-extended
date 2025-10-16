import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button";
import { runningUnoGame } from "../../typings/unoGame.js";
import { ButtonIDs, maxPlayerInGame } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.JOIN_MID_GAME,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id) as runningUnoGame;
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.playersWhoLeft.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.playerLeft", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (game.players.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.inTheGame", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.players.length >= 12) return interaction.reply({
            content: t("strings:errors.tooManyInGame", { lng, count: maxPlayerInGame }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });
        game.players.push(interaction.user.id);
        game.cards[interaction.user.id] = await draw(game.cardsQuota, Math.ceil((Object.keys(game.cards).map(p => game.cards[p].length).reduce((a, b) => a + b, 0)) / Object.keys(game.cards).length));
        await endTurn(client, game, interaction, game.currentPlayer, "misc", t("strings:game.joined", { name: await getUsername(client, game.guildId, interaction.user.id, !game.guildApp), lng }), false);
    }
};
