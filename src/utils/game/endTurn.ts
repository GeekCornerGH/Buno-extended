import { ButtonInteraction, Client, StringSelectMenuInteraction, TextChannel } from "discord.js";
import { t } from "i18next";

import runningGameMessage from "../../components/runningGameMessage.js";
import { runningUnoGame } from "../../typings/unoGame.js";
import { config } from "../config.js";
import { cardEmotes, coloredUniqueCards, colorEmotes, uniqueVariants } from "../constants.js";
import { getUsername } from "../getUsername.js";
import timeouts from "../timeoutManager.js";
import endGame from "./endGame.js";
import onTimeout from "./onTimeout.js";
import toTitleCase from "./toTitleCase.js";

export default async (client: Client, game: runningUnoGame, interaction: StringSelectMenuInteraction | ButtonInteraction, previousPlayer: string, type: "played" | "skipped" | "misc", toAppend?: string, showPlayedCard: boolean = true) => {
    if (!interaction.inGuild()) return;
    const lng = game.locale;
    timeouts.delete(game.channelId);
    timeouts.set(game.channelId, () => onTimeout(client, game, game.currentPlayer), game.settings.timeoutDuration * 1000);
    if (showPlayedCard || type !== "misc") game.log.push({ player: previousPlayer, card: game.currentCard, adminAbused: game.adminAbused });
    const isUnique = uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]);
    const currentCardEmote = isUnique ? config.emoteless ? colorEmotes.other : coloredUniqueCards[game.currentCard as keyof typeof coloredUniqueCards] : cardEmotes[game.currentCard];
    await (interaction.channel as TextChannel).send(`${showPlayedCard ? `${t("strings:game.played", { lng, name: await getUsername(client, game.guildId, previousPlayer), currentCardEmote, card: toTitleCase(game.currentCard, lng) })}\n` : ""}${toAppend ?? ""}`.trim());
    await interaction.channel?.messages.cache.get(game.messageId)?.delete();
    await interaction.deleteReply();
    if ((game._modified && game.players.length === 0) || (!game._modified && game.players.length === 1)) return endGame(game, interaction.client, "notEnoughPeople");
    if (game.cards[previousPlayer] && game.cards[previousPlayer].length === 0) return endGame(game, interaction.client, "win", previousPlayer);
    const msg = await (interaction.channel as TextChannel).send(await runningGameMessage(client, game));
    game.messageId = msg.id;
    if (type !== "misc") {
        game.canSkip = false;
        game.adminAbused = false;
        game.turnCount += 1;
        game.turnProgress = "chooseCard";
        game.jumpedIn = false;
    }
};
