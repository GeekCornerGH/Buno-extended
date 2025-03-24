
import { MessageFlags, TextChannel } from "discord.js";
import { t } from "i18next";

import runningGameMessage from "../../components/runningGameMessage.js";
import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import endGame from "../../utils/game/endGame.js";
import next from "../../utils/game/next.js";
import onTimeout from "../../utils/game/onTimeout.js";
import { getUsername } from "../../utils/getUsername.js";
import timeouts from "../../utils/timeoutManager.js";

export const b: button = {
    name: ButtonIDs.LEAVE_GAME_CONFIRMATION_YES,
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
        await interaction.deferUpdate();
        const index = game.players.findIndex(p => p === interaction.user.id);
        if (game.currentPlayer === interaction.user.id) game.currentPlayer = next(game.players, index);
        game.players.splice(index, 1);
        await interaction.deleteReply();
        game.playersWhoLeft.push(interaction.user.id);
        timeouts.delete(game.channelId);
        timeouts.set(game.channelId, () => onTimeout(client, game, game.currentPlayer), game.settings.timeoutDuration * 1000);
        const leaveMessage = t("strings:game.left", { name: await getUsername(client, game.guildId, interaction.user.id, !game.guildApp), lng });
        if (game.guildApp) {
            await interaction.channel?.messages.cache.get(game.messageId)?.delete();
            await (interaction.channel as TextChannel).send(leaveMessage);
        }
        else game.previousActions.push(leaveMessage);
        if ((game._modified && game.players.length === 0) || (!game._modified && game.players.length === 1)) return endGame(game, interaction.client, "notEnoughPeople");
        if (game.guildApp) {
            const msg = await (interaction.channel as TextChannel).send(await runningGameMessage(client, game));
            game.messageId = msg.id;
        }
        else await interaction.editReply({
            message: game.messageId,
            ...await runningGameMessage(client, game)
        });
    }
};
