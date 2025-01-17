import { InteractionReplyOptions, MessageFlags } from "discord.js";
import { t } from "i18next";

import chooseColor from "../../components/chooseColor.js";
import forceDraw from "../../components/forceDraw.js";
import pickPlayer from "../../components/pickPlayer.js";
import playCard from "../../components/playCard.js";
import { button } from "../../typings/button";
import { runningUnoGame } from "../../typings/unoGame.js";
import { ButtonIDs, uniqueVariants } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.PLAY_CARD,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id) as runningUnoGame;
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
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });
        if (game.turnProgress === "chooseColor") {
            return interaction.editReply({
                ...chooseColor(game.playedCard as typeof uniqueVariants[number], lng) as InteractionReplyOptions
            });
        }
        else if (game.turnProgress === "pickPlayer") {
            return interaction.editReply({
                ... await pickPlayer(client, game, interaction.user.id)
            });
        }
        else if ((game.settings.allowStacking || game.settings.reverseAnything) && game.drawStack > 0) {
            const toSend = forceDraw(client, interaction, game, interaction.user.id);
            if (Object.keys(toSend).length === 0) return;
            return interaction.editReply({
                ...toSend,
                content: `${game.settings.allowContest && game.currentCard.endsWith("+4") && game.drawStack === 4 ? "Allow +4 contest rule is enabled. You may contest the card through the Actions menu." : ""}`,
            });
        }
        const toSend = await playCard(client, interaction, game, interaction.user.id, game.canSkip);
        if (Object.keys(toSend).length === 0) return;
        return interaction.editReply({
            ...toSend,
        });
    }
};
