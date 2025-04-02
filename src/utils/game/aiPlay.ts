import { Channel, Client, TextChannel } from "discord.js";
import { t } from "i18next";
import { ChatModel } from "openai/resources/shared.js";

import { guildRunningGame, runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { colors, uniqueVariants } from "../constants.js";
import { getUsername } from "../getUsername.js";
import openAIClient from "../openAIClient.js";
import endGame from "./endGame.js";
import endTurn from "./endTurn.js";
import next from "./next.js";
import playableCards from "./playableCard.js";
import playCard from "./playCard.js";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function aiPlay(client: Client, game: guildRunningGame): Promise<unknown> {
    if (!game.guildApp) return;
    const cardsToPlay = playableCards(game.cards[game.currentPlayer], game.currentCard, game);
    console.log(cardsToPlay);
    const playerHolder = game.currentPlayer;
    game.aiConversation.push({
        role: "user",
        content: JSON.stringify({
            username: game.currentPlayer.split("-")[1],
            cards: cardsToPlay,
            amount: game.drawStack ?? null,
            previousActions: game.log.slice(Math.max(game.log.length - 5, 0)).map(a => ({
                card: a.card,
                amount: a.card === "forceDraw" ? a.amount : undefined,
                player: a.player
            })),
            drawStack: game.drawStack,
            canSkip: game.canSkip,
            otherCards: Object.values(game.cards).filter(([p]) => p !== game.currentPlayer).map(([p, cards]) => [p, cards.length])
        })
    });
    const channel = client.channels.cache.get(game.channelId);
    const maxWait = 10;
    const minWait = 6.5;
    await sleep((Math.random() * (maxWait - minWait) + minWait) * 1000);
    try {
        const conversation = await openAIClient.chat.completions.create({
            model: "mistral-medium" as unknown as ChatModel,
            messages: game.aiConversation,
            max_tokens: 20
        });
        const message = conversation.choices[0];
        if (!message || !message.message.content) return leave(client, game, channel as Channel, playerHolder);
        const answer = JSON.parse(message.message.content) as aiResponse;
        console.log(answer);

        if (game.currentPlayer !== playerHolder) return;

        if (answer.action === "draw" || (!game.canSkip && answer.action === "skip")) return await playCard(game, answer.action, null, game.locale, client);
        else if (answer.action === "card") {
            for (const variant of uniqueVariants) {
                for (const color of colors) {
                    cardsToPlay.push(`${color}-${variant}`);
                }
                cardsToPlay.splice(cardsToPlay.findIndex(c => c === variant), 1);
            }
            if (!cardsToPlay.includes(answer.card)) return leave(client, game, channel as Channel, playerHolder);
            return await playCard(game, answer.card, null, game.locale, client);
        }
        else if (answer.action === "skip" && game.canSkip) return await playCard(game, answer.action, null, game.locale, client);
        game.aiConversation.push({ content: message.message.content, role: message.message.role });
    }
    catch (e) {
        console.error(e);
        return leave(client, game, channel as TextChannel, playerHolder);
    }

}

async function leave(client: Client, game: runningUnoGame, channel: Channel, player: string) {
    game.playersWhoLeft.push(player);
    game.currentPlayer = next(game.players, game.players.findIndex(p => p === player), 1);
    game.players.splice(game.players.findIndex(p => p === player), 1);
    if (game.guildApp && channel.isSendable()) await channel.send(t("strings:game.left", { lng: game.locale.split("-")[0], name: await getUsername(client, game.guildId, player, !game.guildApp) }));
    if (game.players.length < 2) return endGame(game, client, "notEnoughPeople", game.players[0] ?? undefined);
    endTurn(client, game, null, player, "misc");
}

type aiDraws = {
    action: "draw"
}

type aiPlays = {
    action: "card",
    card: unoCard | `${typeof colors[number]}-${typeof uniqueVariants[number]}`
}

type aiSkips = {
    action: "skip"
}

type aiResponse = aiDraws | aiPlays | aiSkips;
