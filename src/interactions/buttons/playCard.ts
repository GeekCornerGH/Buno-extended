import { InteractionReplyOptions, MessageFlags, TextChannel } from "discord.js";
import { t } from "i18next";

import chooseColor from "../../components/chooseColor.js";
import forceDraw from "../../components/forceDraw.js";
import pickPlayer from "../../components/pickPlayer.js";
import playCard from "../../components/playCard.js";
import { button } from "../../typings/button";
import { runningUnoGame } from "../../typings/unoGame.js";
import { ButtonIDs, colors, uniqueVariants } from "../../utils/constants.js";
import playCardLogic from "../../utils/game/playCard.js";
import { getUsername } from "../../utils/getUsername.js";

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
        if (game.currentPlayer !==interaction.user.id && game.settings.jumpIn && !game.jumpedIn && (game.cards[interaction.user.id].includes(game.currentCard) || ((game.currentCard.endsWith("-wild") || game.currentCard.endsWith("-+4") && game.cards[interaction.user.id].includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]))))) {
            game.jumpedIn = true;
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });
            game.currentPlayer = interaction.user.id;
            await (interaction.channel as TextChannel).send(t("strings:game.jumpedIn", { lng, name: await getUsername(client, game.guildId, interaction.user.id) }));
            if (uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]) || game.currentCard.endsWith("-7")) {
                game.playedCard = uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]) ? game.currentCard.split("-")[1] as "wild" | "+4" : game.currentCard as `${typeof colors[number]}-7`;
                if (game.playedCard.endsWith("-7")) {
                    game.turnProgress = "pickPlayer";
                    return await interaction.editReply({
                        ...await pickPlayer(client, game, interaction.user.id)
                    });
                }
                game.turnProgress = "chooseColor";
                return await interaction.editReply({
                    ...chooseColor(game.playedCard as typeof uniqueVariants[number], lng)
                });
            }
            else playCardLogic(game, game.currentCard, interaction, lng);
        }
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
            const toSend = await forceDraw(client, interaction, game, interaction.user.id);
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
