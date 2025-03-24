import { MessageFlags } from "discord.js";
import { t } from "i18next";

import { stringSelect } from "../../typings/stringSelect.js";
import { unoCard } from "../../typings/unoGame.js";
import { SelectIDs } from "../../utils/constants.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import { getUsername } from "../../utils/getUsername.js";

export const s: stringSelect = {
    name: SelectIDs.PLAYER_USER_SELECT,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        await interaction.deferUpdate();
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
        if (game.currentPlayer !== interaction.user.id) {
            return interaction.editReply({
                content: t("strings:game.notYourTurn", { lng }),
                components: []
            });
        }
        const player = interaction.values[0];
        if (player === interaction.user.id) return interaction.editReply({
            content: "You can't give cards to yourself"
        });
        const tempHolder = game.cards[interaction.user.id];
        game.cards[interaction.user.id] = game.cards[player];
        game.cards[player] = tempHolder;
        game.currentCard = game.playedCard as unoCard;
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
        game.turnProgress = "chooseCard";
        if (game.settings.shouldYellBUNO && game.unoPlayers.includes(interaction.user.id)) {
            game.unoPlayers.push(player);
            game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === interaction.user.id), 1);
        }
        if (game.settings.shouldYellBUNO && game.unoPlayers.includes(player)) {
            game.unoPlayers.push(interaction.user.id);
            game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === player), 1);
        }
        endTurn(client, game, interaction, interaction.user.id, "played", `**${await getUsername(client, game.guildId, interaction.user.id, !game.guildApp)}** exchanged cards with **${await getUsername(client, game.guildId, player, !game.guildApp)}**`);
    }
};
