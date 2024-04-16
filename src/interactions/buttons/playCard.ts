import { InteractionReplyOptions } from "discord.js";

import { button } from "../../../typings/button";
import { runningUnoGame } from "../../../typings/unoGame";
import chooseColor from "../../components/chooseColor";
import forceDraw from "../../components/forceDraw";
import pickPlayer from "../../components/pickPlayer";
import playCard from "../../components/playCard";
import { ButtonIDs, uniqueVariants } from "../../utils/constants";

export const b: button = {
    name: ButtonIDs.PLAY_CARD,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id) as runningUnoGame;
        if (!game) return interaction.reply({
            content: "Unable to find the game you're talking about.",
            ephemeral: true
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: "You're not part of the game.",
            ephemeral: true,
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: "It's not your turn.",
            ephemeral: true
        });
        await interaction.deferReply({
            ephemeral: true
        });
        if ((game.settings.allowStacking || game.settings.reverseAnything) && game.drawStack > 0) {
            const toSend = forceDraw(client, interaction, game, interaction.user.id);
            if (Object.keys(toSend).length === 0) return;
            return interaction.editReply({
                ...toSend,
                content: `${game.settings.allowContest && game.currentCard.endsWith("+4") && game.drawStack === 4 ? "Allow +4 contest rule is enabled. You may contest the card through the Actions menu." : ""}`,
            });
        }
        if (game.turnProgress === "chooseColor") {
            return interaction.editReply({
                ...chooseColor(game.playedCard as typeof uniqueVariants[number]) as InteractionReplyOptions
            });
        }
        else if (game.turnProgress === "pickPlayer") {
            return interaction.editReply({
                ...pickPlayer(client, game, interaction.user.id)
            });
        }
        const toSend = playCard(client, interaction, game, interaction.user.id, game.canSkip);
        if (Object.keys(toSend).length === 0) return;
        return interaction.editReply({
            ...toSend,
        });
    }
};
