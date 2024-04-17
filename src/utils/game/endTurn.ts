import { ButtonInteraction, GuildMember, StringSelectMenuInteraction } from "discord.js";

import runningGameMessage from "../../components/runningGameMessage.js";
import { customClient } from "../../typings/client.js";
import { runningUnoGame } from "../../typings/unoGame.js";
import { config } from "../config.js";
import { cardEmotes, coloredUniqueCards, colorEmotes, uniqueVariants } from "../constants.js";
import timeouts from "../timeoutManager.js";
import endGame from "./endGame.js";
import onTimeout from "./onTimeout.js";
import toTitleCase from "./toTitleCase.js";

export default async (client: customClient, game: runningUnoGame, interaction: StringSelectMenuInteraction | ButtonInteraction, previousPlayer: string, type: "played" | "skipped" | "misc", toAppend?: string, showPlayedCard: boolean = true) => {
    timeouts.delete(game.channelId);
    timeouts.set(game.channelId, () => onTimeout(client, game, game.currentPlayer), game.settings.timeoutDuration * 1000);
    if (showPlayedCard || type !== "misc") game.log.push({ player: previousPlayer, card: game.currentCard, adminAbused: game.adminAbused });
    const isUnique = uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]);
    const currentCardEmote = isUnique ? config.emoteless ? colorEmotes.other : coloredUniqueCards[`${game.currentCard}`] : cardEmotes[game.currentCard];
    await interaction.channel.send(`${showPlayedCard ? `**${(interaction.guild.members.cache.get(previousPlayer) as GuildMember).displayName}** played ${currentCardEmote} ${toTitleCase(game.currentCard)}\n` : ""}${toAppend ?? ""}`.trim());
    await interaction.channel.messages.cache.get(game.messageId).delete();
    await interaction.deleteReply();
    if ((game._modified && game.players.length === 0) || (!game._modified && game.players.length === 1)) return endGame(game, interaction.client as customClient, "notEnoughPeople");
    if (game.cards[previousPlayer] && game.cards[previousPlayer].length === 0) return endGame(game, interaction.client as customClient, "win", previousPlayer);
    const msg = await interaction.channel.send(await runningGameMessage(game, interaction.guild));
    game.messageId = msg.id;
    game.canSkip = false;
    game.adminAbused = false;
    game.turnCount += 1;
    game.turnProgress = "chooseCard";
};
