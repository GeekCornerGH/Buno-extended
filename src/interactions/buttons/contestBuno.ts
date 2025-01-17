import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.CONTEST_SHOUT_UNO,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state !== "inProgress") return interaction.reply({
            content: t("strings:errors.notRunningWrongButton", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notInGame", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        const previousPlayer = game.log[game.log.length - 1].player;
        if (!previousPlayer) return interaction.reply({
            content: t("strings:errors.gameJustStarted", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.cards[previousPlayer].length !== 1) return interaction.reply({
            content: t("strings:game.buno.contest.tooManyCards", { lng, name: await getUsername(client, game.guildId, previousPlayer) }),
            flags: MessageFlags.Ephemeral
        });
        if (game.unoPlayers.includes(previousPlayer)) return interaction.reply({
            content: t("strings:game.buno.contest.alreadyYelled", { lng, name: await getUsername(client, game.guildId, previousPlayer) }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        const toAppend = t("strings:game.buno.contest.drew", { lng, name: await getUsername(client, game.guildId, interaction.user.id), drawer: await getUsername(client, game.guildId, previousPlayer), stack: 2 });
        game.cards[previousPlayer] = game.cards[previousPlayer].concat(draw(game.cardsQuota, 2));
        endTurn(client, game, interaction, interaction.user.id, "misc", toAppend, false);
    }
};
