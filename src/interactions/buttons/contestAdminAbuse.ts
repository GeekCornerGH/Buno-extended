import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.CONTEST_ADMIN_ABUSE,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            ephemeral: true
        });
        if (game.state !== "inProgress") return interaction.reply({
            content: t("strings:errors.notRunningWrongButton", { lng }),
            ephemeral: true,
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notInGame", { lng }),
            ephemeral: true,
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            ephemeral: true,
        });
        const prevTurn = game.log[game.log.length - 1];
        if (!prevTurn) return interaction.reply({
            content: t("strings:errors.gameJustStarted", { lng }),
            ephemeral: true
        });
        if (prevTurn.player !== game.hostId) return interaction.reply({
            content: t("strings:errors.notContestingHost", { lng }),
            ephemeral: true
        });
        await interaction.deferUpdate();
        if (!prevTurn.adminAbused) {
            game.cards[interaction.user.id] = game.cards[interaction.user.id].concat(draw(game.cardsQuota, 3));
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            endTurn(client, game, interaction, interaction.user.id, "misc", t("strings:game.aa.messages.contestAndFailed", { lng, name: await getUsername(client, game.guildId, interaction.user.id), host: await getUsername(client, game.guildId, game.hostId), count: 3 }), false);
        }
        else {
            game.players.splice(game.players.findIndex(p => p === game.hostId), 1);
            await endTurn(client, game, interaction, interaction.user.id, "misc", t("strings:game.aa.messages.contestAndKicked", { lng, name: await getUsername(client, game.guildId, interaction.user.id), host: await getUsername(client, game.guildId, game.hostId) }));
        }
    }
};
