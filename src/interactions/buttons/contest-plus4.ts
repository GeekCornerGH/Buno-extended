import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.CONTEST_PLUS4,
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
        if (!game.currentCard.endsWith("-+4")) return interaction.reply({
            content: t("strings:errors.unusable", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.drawStack === 0) return interaction.reply({
            content: t("strings:errors.unusable", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const [pColor] = game.log[game.log.length - 2].card.split("-");
        let toAppend: string = "";
        const prevPlayer = game.log[game.log.length - 1].player;
        if (interaction.user.id === prevPlayer) return interaction.reply({
            content: t("strings:errors.cantContestYourOwn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        if (game.cards[prevPlayer].findIndex(c => c.startsWith(pColor)) !== -1) {
            game.cards[prevPlayer] = game.cards[prevPlayer].concat(await draw(game.cardsQuota, game.drawStack));
            if (game.cards[prevPlayer].length >= 2 && game.unoPlayers.includes(prevPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === prevPlayer), 1);
            toAppend += t("strings:game.forceDraw.contestPlus4", { name: await getUsername(client, game.guildId, interaction.user.id, !game.guildApp), stack: game.drawStack, cardPlayer: await getUsername(client, game.guildId, prevPlayer, !game.guildApp), lng });
            game.drawStack = 0;
            endTurn(client, game, interaction, interaction.user.id, "misc", toAppend, false);
        }
        else {
            game.drawStack = +2;
            toAppend += t("strings:game.forceDraw.contestPlus4AndFail", { name: await getUsername(client, game.guildId, interaction.user.id, !game.guildApp), stack: game.drawStack, cardPlayer: await getUsername(client, game.guildId, prevPlayer, !game.guildApp), lng });
            if (game.cards[prevPlayer].length >= 2 && game.unoPlayers.includes(prevPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === prevPlayer), 1);
            game.cards[prevPlayer] = game.cards[prevPlayer].concat(await draw(game.cardsQuota, game.drawStack));
            game.drawStack = 0;
            endTurn(client, game, interaction, interaction.user.id, "misc", toAppend, false);
        }
    }
};
