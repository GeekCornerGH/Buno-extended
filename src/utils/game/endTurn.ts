import { ButtonInteraction, Client, MessageEditOptions, StringSelectMenuInteraction, TextChannel } from "discord.js";
import { t } from "i18next";

import runningGameMessage from "../../components/runningGameMessage.js";
import { runningUnoGame } from "../../typings/unoGame.js";
import { config } from "../config.js";
import { cardEmotes, coloredUniqueCards, colorEmotes, uniqueVariants } from "../constants.js";
import { getUsername } from "../getUsername.js";
import timeouts from "../timeoutManager.js";
import { aiPlay } from "./aiPlay.js";
import endGame from "./endGame.js";
import onTimeout from "./onTimeout.js";
import toTitleCase from "./toTitleCase.js";

export default async (client: Client, game: runningUnoGame, interaction: StringSelectMenuInteraction | ButtonInteraction | null, previousPlayer: string, type: "played" | "skipped" | "misc", toAppend?: string, showPlayedCard: boolean = true) => {
    const lng = game.locale;
    timeouts.delete(game.channelId);
    timeouts.set(game.channelId, () => onTimeout(client, game, game.currentPlayer), game.settings.timeoutDuration * 1000);
    if (showPlayedCard || type !== "misc") game.log.push({ player: previousPlayer, card: game.currentCard, adminAbused: game.adminAbused });
    const isUnique = uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]);
    const currentCardEmote = isUnique ? config.emoteless ? colorEmotes.other : coloredUniqueCards[game.currentCard as keyof typeof coloredUniqueCards] : cardEmotes[game.currentCard];
    const toSend = `${showPlayedCard ? `${t("strings:game.played", { lng, name: await getUsername(client, game.guildId, previousPlayer, !game.guildApp), currentCardEmote, card: toTitleCase(game.currentCard, lng) })}\n` : ""}${toAppend ?? ""}`.trim();
    if (game.guildApp) await (client.channels.cache.get(game.channelId) as TextChannel).send(toSend);
    else game.previousActions?.push(toSend);
    if (game.guildApp) await (client.channels.cache.get(game.channelId) as TextChannel)?.messages.cache.get(game.messageId)?.delete();
    else if (game.mentionId && interaction) await interaction.deleteReply(game.mentionId);
    if (interaction) await interaction.deleteReply();
    if ((game._modified && game.players.length === 0) || (!game._modified && game.players.length === 1)) return endGame(game, client, "notEnoughPeople");
    if (game.cards[previousPlayer] && game.cards[previousPlayer].length === 0) return endGame(game, client, "win", previousPlayer);
    const toEdit = await runningGameMessage(client, game);
    if (game.guildApp) {
        const msg = await (client.channels.cache.get(game.channelId) as TextChannel).send(toEdit);
        game.messageId = msg.id;
    }
    else if (interaction) {
        await interaction.editReply({ ...toEdit as MessageEditOptions, message: game.messageId });
        game.interaction = interaction;
        game.mentionId = (await interaction.followUp({
            content: t("strings:game.mention", { mention: `<@${game.currentPlayer}>`, lng }) + `\nhttps://discord.com/channels/${game.interaction.inGuild() ? game.interaction.guildId : "@me"}/${game.channelId}/${game.messageId}`,
        })).id;
    }
    if (type !== "misc") {
        game.canSkip = false;
        game.adminAbused = false;
        game.turnCount += 1;
        game.turnProgress = "chooseCard";
        game.jumpedIn = false;
    }
    if (game.currentPlayer.startsWith("AI-") && game.guildApp) await aiPlay(client, game);
};
