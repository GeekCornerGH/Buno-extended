import { GuildMember, GuildTextBasedChannel } from "discord.js";

import runningGameMessage from "../../components/runningGameMessage.js";
import { customClient } from "../../typings/client.js";
import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { config } from "../config.js";
import { cardEmotes, coloredUniqueCards, colorEmotes, colors, uniqueVariants } from "../constants.js";
import draw from "./draw.js";
import endGame from "./endGame.js";
import next from "./next.js";
import toTitleCase from "./toTitleCase.js";

export default async (client: customClient, game: runningUnoGame, player: string) => {
    if (!game || !client.games.find(g => g.uid === game.uid) || game.currentPlayer !== player || game.uid !== client.games.find(g => g.channelId === game.channelId).uid) return;
    let toAppend: string = "";
    const previousPlayer = game.currentPlayer;
    if (game.turnProgress === "chooseColor") {
        game.currentCard = `${colors[Math.floor(Math.random() * colors.length)]}-${game.playedCard}` as unoCard;
        if (game.playedCard === "+4") {
            if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => (c.startsWith(game.currentCard.split("-")[0]) && c.endsWith("-+2")) || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-reverse")))) {
                game.drawStack += 4;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
            }
            else {
                game.drawStack += 4;
                const nextPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
                toAppend += `\n**${(client.guilds.cache.get(game.guildId).members.cache.get(nextPlayer) as GuildMember).displayName}** drew ${game.drawStack} cards and has been skipped.`;
                game.cards[nextPlayer] = game.cards[nextPlayer].concat(draw(game.cardsQuota, game.drawStack));
                if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
                game.turnProgress = "chooseCard";
                game.drawStack = 0;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer), 2);
            }
        }
    }
    else if (game.turnProgress === "pickPlayer") {
        const players = game.players.filter(p => p !== previousPlayer);
        const chosenOne = players[Math.floor(Math.random() * players.length)];
        const tempHolder = game.cards[chosenOne];
        game.cards[chosenOne] = game.cards[previousPlayer];
        game.cards[previousPlayer] = tempHolder;
        game.currentCard = game.playedCard;
        toAppend += `\n**${client.guilds.cache.get(game.guildId).members.cache.get(previousPlayer).displayName}** exchanged cards with **${client.guilds.cache.get(game.guildId).members.cache.get(chosenOne).displayName}**.`;
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer), 1);
    }
    else {
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer), 1);
    }
    if (game.settings.kickOnTimeout) {
        game.players.splice(game.players.findIndex(p => p === previousPlayer), 1);
        delete game.cards[previousPlayer];
    }
    toAppend += `\n**${(client.guilds.cache.get(game.guildId).members.cache.get(previousPlayer)).displayName}** was inactive and has been ${game.settings.kickOnTimeout ? "kicked" : "skipped"}.`;
    const isUnique = uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]);
    const currentCardEmote = isUnique ? config.emoteless ? colorEmotes.other : coloredUniqueCards[`${game.currentCard}`] : cardEmotes[game.currentCard];
    await (client.channels.cache.get(game.channelId) as GuildTextBasedChannel).send(`**${(client.guilds.cache.get(game.guildId).members.cache.get(previousPlayer) as GuildMember).displayName}** played ${currentCardEmote} ${toTitleCase(game.currentCard)}\n${toAppend ?? ""}`.trim());
    await (client.channels.cache.get(game.channelId) as GuildTextBasedChannel).messages.cache.get(game.messageId).delete();
    if (game.settings.kickOnTimeout) {
        if (game._modified && game.players.length === 0) return endGame(game, client, "notEnoughPeople");
        else if (game.players.length === 1) return endGame(game, client, "win", game.currentPlayer);
    }
    const msg = await (client.channels.cache.get(game.channelId) as GuildTextBasedChannel).send(await runningGameMessage(game, client.guilds.cache.get(game.guildId)));
    game.messageId = msg.id;
    game.turnProgress = "chooseCard";
    game.log.push({ player: previousPlayer, card: game.currentCard, adminAbused: game.adminAbused });
    game.canSkip = false;
    game.turnCount += 1;
};
