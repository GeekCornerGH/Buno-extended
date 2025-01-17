import { InteractionUpdateOptions, MessageFlags, Snowflake, TextChannel } from "discord.js";
import { t } from "i18next";

import chooseColor from "../../components/chooseColor.js";
import pickPlayer from "../../components/pickPlayer.js";
import playCard from "../../components/playCard.js";
import { stringSelect } from "../../typings/stringSelect.js";
import { unoCard } from "../../typings/unoGame.js";
import { colors, maxDrawAsSabotage, SelectIDs, uniqueVariants, variants } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import use from "../../utils/game/use.js";
import { getUsername } from "../../utils/getUsername.js";

export const s: stringSelect = {
    name: SelectIDs.CHOOSE_CARD,
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const card = interaction.values[0] as unoCard | typeof uniqueVariants[number] | "draw" | "skip";
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
        const { currentCard } = game;
        const index = game.cards[interaction.user.id].findIndex(c => c === card);
        const [color, type] = card.split("-") as [typeof colors[number], typeof variants[number]];
        if (game.currentPlayer !== interaction.user.id) {
            return interaction.editReply({
                content: t("strings:game.notYourTurn", { lng }),
                components: []
            });
        }
        if (game.drawStack > 0) {
            (interaction.channel as TextChannel).send(t("strings:game.card.avoidDraw", { lng, name: await getUsername(client, game.guildId, interaction.user.id) }));
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        const playableCards: Array<unoCard | "skip" | "draw"> = game.cards[interaction.user.id].filter(c => uniqueVariants.includes(c as typeof uniqueVariants[number]) || c.startsWith(currentCard.split("-")[0]) || c.endsWith(currentCard.split("-")[1]));
        playableCards.push("draw");
        if (game.canSkip) playableCards.push("skip");
        if (!playableCards.includes(card)) return interaction.editReply({
            content: t("strings:game.notPlayable", { lng }),
            components: []
        });
        let toAppend: string = "";
        if (card === "draw") {
            if (game.saboteurs[interaction.user.id] && game.saboteurs[interaction.user.id] >= maxDrawAsSabotage) {
                game.players.splice(game.players.findIndex(p => p === interaction.user.id), 1);
                game.playersWhoLeft.push(interaction.user.id);
                toAppend = t("strings:game.draw.sab", { lng, name: await getUsername(client, game.guildId, interaction.user.id) });
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
                return endTurn(client, game, interaction, game.currentPlayer, "misc", toAppend, false);
            }
            if ((game.cards[interaction.user.id].filter(c => uniqueVariants.includes(c as typeof uniqueVariants[number]) || c.startsWith(game.currentCard.split("-")[0]) || c.endsWith(game.currentCard.split("-")[1])))[0]) {
                if (game.saboteurs[interaction.user.id]) game.saboteurs[interaction.user.id] += 1;
                else game.saboteurs[interaction.user.id] = 1;
            }
            else if (game.saboteurs[interaction.user.id] && game.saboteurs[interaction.user.id] > 0) game.saboteurs[interaction.user.id] -= 1;
            const newCard = draw(game.cardsQuota, 1)[0];
            game.cards[interaction.user.id].push(newCard);
            if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
            if (!game.settings.allowSkipping) {
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
                return endTurn(client, game, interaction, interaction.user.id, "misc", t("strings:game.draw.drew", { lng, name: await getUsername(client, game.guildId, interaction.user.id) }), false);
            }
            else {
                game.canSkip = true;
                const toSend = await playCard(client, interaction, game, interaction.user.id, game.canSkip, newCard);
                (interaction.channel as TextChannel).send(t("strings:game.draw.drew", { lng, name: await getUsername(client, game.guildId, interaction.user.id) }));
                if (Object.keys(toSend).length === 0) return;
                return await interaction.editReply({ ...toSend });
            }
        }
        else if (card === "skip") {
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            return endTurn(client, game, interaction, interaction.user.id, "misc", t("strings:game.draw.skip", { lng, name: await getUsername(client, game.guildId, interaction.user.id) }), false);
        }
        if (index < 0) {
            (interaction.channel as TextChannel)?.send(t("strings:game.card.unknown", { lng, name: await getUsername(client, game.guildId, interaction.user.id) }));
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        use(game, card as unoCard, interaction.user.id);
        if (uniqueVariants.includes(card as typeof uniqueVariants[number])) {
            game.turnProgress = "chooseColor";
            game.playedCard = card as typeof uniqueVariants[number];
            return interaction.editReply({
                ...chooseColor(card as typeof uniqueVariants[number], game.locale) as InteractionUpdateOptions
            });
        }
        if (type === "reverse") {
            game.currentCard = card;
            game.players = game.players.reverse();
            if (game.players.length <= 2) toAppend = t("strings:game.card.skippedPlayer", { lng, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer))) });
            else {
                toAppend = t("strings:game.card.reversed", { lng });
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
            }
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else if (type === "block") {
            game.currentCard = card;
            toAppend = t("strings:game.card.skippedPlayer", { lng, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer))) });
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id), 2);
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else if (type === "+2") {
            game.currentCard = card;
            if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-+2") || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c === color + "-reverse"))) {
                game.drawStack += 2;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
                endTurn(client, game, interaction, interaction.user.id, "played");
            }
            else {
                game.drawStack += 2;
                toAppend = t("strings:game.draw.drewAndSkipped", { lng, name: await getUsername(client, game.guildId, next(game.players, game.players.findIndex(p => p === game.currentPlayer))), stack: game.drawStack });
                if (game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].length >= 2 && game.unoPlayers.includes(next(game.players, game.players.findIndex(p => p === game.currentPlayer)))) game.unoPlayers.splice(game.unoPlayers.findIndex(u => u === next(game.players, game.players.findIndex(p => p === game.currentPlayer))), 1);
                game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))] = game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].concat(draw(game.cardsQuota, game.drawStack));
                game.turnProgress = "chooseCard";
                game.drawStack = 0;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id), 2);
                endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
            }
        }
        else if (game.settings.sevenAndZero && ["7", "0"].includes(type)) {
            if (type === "7") {
                game.turnProgress = "pickPlayer";
                game.playedCard = card as `${typeof colors[number]}-7`;
                return interaction.editReply({ ... await pickPlayer(client, game, interaction.user.id) });
            }
            else if (type === "0") {
                game.currentCard = card;
                toAppend += t("strings:game.card.allSwapped", { lng });
                const keys = Object.keys(game.cards);
                keys.unshift(keys.pop() as string);
                if (game.settings.shouldYellBUNO) {
                    for (let i = 0; i < keys.length; i++) {
                        if (game.unoPlayers.includes(keys[i])) {
                            game.unoPlayers.splice(game.unoPlayers.indexOf(keys[i]), 1);
                            game.unoPlayers.push(keys[(i + 1) % keys.length]);
                        }
                    }
                }
                const numPlayers = keys.length;
                const newCards: { [userId: Snowflake]: unoCard[] } = {};
                for (let i = 0; i < numPlayers; i++) {
                    const currentPlayerKey = keys[i];
                    const nextPlayerKey = keys[(i + 1) % numPlayers];

                    newCards[currentPlayerKey] = game.cards[nextPlayerKey] as unoCard[];
                }
                game.cards = newCards;
            }
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
        else {
            game.currentCard = card;
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            endTurn(client, game, interaction, interaction.user.id, "played");
        }
    }
};
