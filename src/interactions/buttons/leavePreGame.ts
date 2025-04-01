import { InteractionUpdateOptions, MessageFlags } from "discord.js";
import { t } from "i18next";

import lobbyGameMessage from "../../components/lobbyGameMessage.js";
import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.LEAVE_GAME_BEFORE_START,
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const game = client.games.find(g => g.messageId === interaction.message.id);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notInGame", { lng }),
            flags: MessageFlags.Ephemeral,
        });
        if (game.state === "inProgress") return interaction.reply({
            content: t("strings:errors.notRunningWrongButton", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.hostId === interaction.user.id) return interaction.reply({
            content: t("strings:leave.leaveAsHost", { lng }),
            flags: MessageFlags.Ephemeral
        });
        game.players.splice(game.players.findIndex(p => p === interaction.user.id), 1);
        interaction.update({ ...await lobbyGameMessage(client, game) as InteractionUpdateOptions });
    }
};
