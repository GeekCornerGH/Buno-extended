import { ComponentInteraction, ComponentTypes, MessageFlags } from "oceanic.js";

import { deleteMessage, sendMessage } from "../client.js";
import { CardColorSelect, PickCardSelect, PlayerUserSelect } from "../components.js";
import { cardEmotes, cards, colors, uniqueVariants, variants } from "../constants.js";
import database from "../database.js";
import { config } from "../index.js";
import timeouts from "../timeouts.js";
import { Card, UnoGame } from "../types.js";
import { getUsername, next, toTitleCase, updateStats, wasLastTurnBlocked } from "../utils.js";
import { games, onTimeout, sendGameMessage } from "./index.js";
import { makeDrawCardProxy } from "./notStarted.js";

function isSabotage(ctx: ComponentInteraction<ComponentTypes.STRING_SELECT>, game: UnoGame<true>): boolean {
    const [ccColor, ccVariant] = game.currentCard.split("-") as [typeof colors[number] | typeof uniqueVariants[number], typeof variants[number]];
    // first card is duration=0, second is duration=1, etc
    let maxDuration = 4; // so default is kick on 5th card drawn
    if (!game.cards[ctx.member.id].find(c => c.startsWith(ccColor) || c.endsWith(ccVariant) || ccColor === "wild" || ccColor === "+4")) return;
    if (game.cards[next(game.players, game.players.indexOf(game.lastPlayer.id))].length <= 2) maxDuration--;
    if (game.saboteurs[game.lastPlayer.id]) maxDuration--;

    if (game.drawDuration >= maxDuration) {
        game.players.splice(game.players.indexOf(ctx.member.id), 1);
        delete game.cards[ctx.member.id];
        game.playersWhoLeft.push(ctx.member.id);

        sendMessage(ctx.channel.id, `Removed **${getUsername(game.lastPlayer.id, true, ctx.guild)}** for attempting to sabotage the game`);
        if (game.players.length <= 1) {
            updateStats(game, game.players[0]);
            return true;
        } else database.set(game.guildID, ctx.member.id, {
            losses: database.getOrCreate(game.guildID, ctx.member.id).losses + 1
        });

        game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        game.lastPlayer.duration = 0;
        sendGameMessage(game);
        return true;
    }

    if (game.drawDuration === maxDuration - 1) {
        game.saboteurs[game.lastPlayer.id] = true;
    }

    return false;
}

export function onColorPlayed(ctx: ComponentInteraction<ComponentTypes.STRING_SELECT>, game: UnoGame<true>) {
    const { currentPlayer } = game;
    if (currentPlayer !== ctx.member.id) return;

    const cardPlayed = ctx.data.values.raw[0] as `${typeof colors[number]}-${typeof uniqueVariants[number]}`;
    const [color, variant] = cardPlayed.split("-") as [typeof colors[number], typeof uniqueVariants[number]];
    let extraInfo = "";

    if (game.lastPlayer.id === game.currentPlayer) game.lastPlayer.duration++;
    else game.lastPlayer = { id: game.currentPlayer, duration: 0 };

    if (game.settings.shouldYellBUNO && game.cards[ctx.member.id].length === 1 && !game.unoPlayers.includes(ctx.member.id)) {
        const { cards, newDeck } = game.draw(2);
        game.cards[ctx.member.id].push(...cards);
        game.deck[ctx.member.id] = newDeck;
        sendMessage(ctx.channel.id, `**${getUsername(ctx.member.id, true, ctx.guild)}** forgot to yell BUNO OUT and drew 2 cards.`);
    }

    if (variant === "+4") {
        const nextPlayer = next(game.players, game.players.indexOf(ctx.member.id));
        if (game.settings.allowStacking && game.cards[nextPlayer].some(c => c === "+4" || c === `${color}-+2`)) {
            game.drawStackCounter += 4;
        }
        else {
            const { cards, newDeck } = game.draw(4 + game.drawStackCounter);
            game.cards[nextPlayer].push(...cards);
            game.deck = newDeck;
            extraInfo = `**${getUsername(nextPlayer, true, ctx.guild)}** drew **${4 + game.drawStackCounter}** cards and was skipped`;
            game.drawStackCounter = 0;
            game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        }
    }

    game.currentCard = variant;
    game.currentCardColor = color;
    game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
    game.hasPlayed = false;
    ctx.deleteOriginal();
    deleteMessage(ctx.message.channel.messages.get(ctx.message.messageReference?.messageID));

    if (game.cards[ctx.member.id].length === 0) return;
    sendMessage(ctx.channel.id, `
    ${`**${getUsername(ctx.member.id, true, ctx.guild)}** played ${cardEmotes[variant]} ${toTitleCase(variant)}, switching the color to ${color}`}\
    ${extraInfo.length ? `\n${extraInfo}` : ""}
    `);

    sendGameMessage(game);
}

export function onForceDrawPlayed(ctx: ComponentInteraction<ComponentTypes.STRING_SELECT>, game: UnoGame<true>) {
    if (game.currentPlayer !== ctx.member.id) return;
    const cardPlayed = ctx.data.values.raw[0] as Card | "draw-forceful";

    if (cardPlayed === "draw-forceful") {
        const { cards, newDeck } = game.draw(game.drawStackCounter);
        game.cards[game.currentPlayer].push(...cards);
        game.deck = newDeck;
        game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        if (game.settings.shouldYellBUNO && game.cards[game.currentPlayer].length > 1 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.indexOf(game.currentPlayer), 1);
        sendMessage(ctx.channel.id, `**${getUsername(ctx.member.id, true, ctx.guild)}** drew ${game.drawStackCounter} cards`);
        game.drawStackCounter = 0;
        ctx.deleteOriginal();
        sendGameMessage(game);
    }
    else onCardPlayed(ctx, game, true);
}

export function onSevenPlayed(ctx: ComponentInteraction<ComponentTypes.STRING_SELECT>, game: UnoGame<true>) {
    if (game.currentPlayer !== ctx.member.id) return;
    const id = ctx.data.values.raw[0];
    if (game.settings.shouldYellBUNO && game.unoPlayers.includes(ctx.member.id)) {
        game.unoPlayers.splice(game.unoPlayers.indexOf(ctx.member.id), 1);
        game.unoPlayers.push(id);
    }
    game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
    game.hasPlayed = false;

    const otherPlayerCards = [...game.cards[id]];
    game.cards[id] = makeDrawCardProxy(game.cards[ctx.member.id], game, id);
    game.cards[ctx.member.id] = makeDrawCardProxy(otherPlayerCards, game, ctx.member.id);

    sendMessage(ctx.channel.id, `**${getUsername(ctx.member.id, true, ctx.guild)}** played \
${cardEmotes[game.currentCard]} ${toTitleCase(game.currentCard)}
**${getUsername(ctx.member.id, true, ctx.guild)}** switched cards with **${getUsername(id, true, ctx.guild)}**`);

    ctx.deleteOriginal();
    deleteMessage(ctx.message.channel.messages.get(ctx.message.messageReference?.messageID));
    sendGameMessage(game);
}

export function onCardPlayed(ctx: ComponentInteraction<ComponentTypes.STRING_SELECT>, game: UnoGame<true>, ignoreDrawStack = false) {
    if (game.currentPlayer !== ctx.member.id) return;
    if (game.hasPlayed === true) return ctx.createFollowup({
        content: "You already played a card.",
        flags: MessageFlags.EPHEMERAL
    });
    const cardPlayed = ctx.data.values.raw[0] as Card | "draw" | "skip";
    const [color, variant] = cardPlayed.split("-") as [typeof colors[number] | typeof uniqueVariants[number], typeof variants[number]];
    const [ccColor, ccVariant] = game.currentCard.split("-") as [typeof colors[number] | typeof uniqueVariants[number], typeof variants[number]];

    if (game.cards[ctx.member.id].indexOf(cardPlayed as Card) === -1 && !["draw", "skip"].includes(cardPlayed)) return ctx.createFollowup({
        content: "nuh uh ☝️",
        flags: MessageFlags.EPHEMERAL
    });

    if (
        color !== ccColor && color !== game.currentCardColor
        && variant !== ccVariant && !["draw", "skip", ...uniqueVariants].includes(color)
    ) return ctx.createFollowup({
        content: "You can't play that card",
        flags: MessageFlags.EPHEMERAL
    });
    if (game.drawStackCounter && !ignoreDrawStack) return ctx.createFollowup({
        content: "nuh uh ☝️",
        flags: MessageFlags.EPHEMERAL
    });
    if (cardPlayed !== "draw") game.hasPlayed = true;
    if (uniqueVariants.includes(color)) {
        game.currentCard = color as typeof uniqueVariants[number];
        game.drawDuration = 0;
        game.cards[ctx.member.id].splice(game.cards[ctx.member.id].indexOf(cardPlayed as Card), 1);
        if (game.cards[ctx.member.id].length === 0) return deleteMessage(game.message);

        return ctx.editOriginal({
            content: "Choose a color",
            components: CardColorSelect(color as typeof uniqueVariants[number]),
            flags: MessageFlags.EPHEMERAL
        });
    }

    if (cardPlayed === "skip" && (!game.settings.allowSkipping || (game.lastPlayer.id !== game.currentPlayer && !wasLastTurnBlocked(game))))
        return ctx.createFollowup({
            content: "nuh uh ☝️",
            flags: MessageFlags.EPHEMERAL
        });
    if (game.lastPlayer.id === game.currentPlayer || (game.players.length === 2 && wasLastTurnBlocked(game)))
        game.lastPlayer.duration++;
    else game.lastPlayer = { id: game.currentPlayer, duration: 0 };
    game.turn++;

    let extraInfo = "";
    if (cardPlayed === "draw") {
        if (game.settings.shouldYellBUNO && game.cards[game.currentPlayer].length > 1 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.indexOf(game.currentPlayer), 1);
        if (game.settings.antiSabotage && isSabotage(ctx, game)) return;
        game.drawDuration++;

        const { cards: newCards, newDeck } = game.draw(1);
        game.cards[ctx.member.id].push(newCards[0]);
        game.cards[ctx.member.id].sort((a, b) => cards.indexOf(a) - cards.indexOf(b));
        game.deck = newDeck;

        if (game.settings.allowSkipping) {
            const components = PickCardSelect(game, ctx.member.id, true);
            if (components) ctx.editOriginal({
                content: config.emoteless
                    ? `You drew a ${cardEmotes[newCards[0]]} ${toTitleCase(newCards[0])}`
                    : `${game.cards[ctx.member.id].map(c => cardEmotes[c]).join(" ")}
You drew ${cardEmotes[newCards[0]]}`,
                components
            });
        }
        else
            ctx.deleteOriginal();
    }

    else if (cardPlayed === "skip") {
        game.drawDuration = 0;
        game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        game.hasPlayed = false;
        ctx.deleteOriginal();
    }

    else {
        game.currentCard = cardPlayed;
        game.currentCardColor = color as typeof colors[number];
        game.drawDuration = 0;
        game.cards[ctx.member.id].splice(game.cards[ctx.member.id].indexOf(cardPlayed), 1);
        if (game.settings.shouldYellBUNO && game.cards[game.currentPlayer].length === 1 && !game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.indexOf(game.currentPlayer), 1);
        if (game.cards[ctx.member.id].length === 0) return deleteMessage(game.message);

        switch (variant) {
            case "reverse": {
                game.players = game.players.reverse();
                if (game.players.length === 2) {
                    game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
                    game.hasPlayed = false;
                    extraInfo = `**${getUsername(game.currentPlayer, true, ctx.guild)}** was skipped`;
                }
                break;
            }
            case "+2": {
                const nextPlayer = next(game.players, game.players.indexOf(ctx.member.id));
                if (game.settings.allowStacking && game.cards[nextPlayer].some(c => c === "+4" || c.endsWith("+2"))) {
                    game.drawStackCounter += 2;
                }
                else {
                    const { cards, newDeck } = game.draw(2 + game.drawStackCounter);
                    game.cards[nextPlayer].push(...cards);
                    game.deck = newDeck;
                    extraInfo = `**${getUsername(nextPlayer, true, ctx.guild)}** drew **${2 + game.drawStackCounter}** cards and was skipped`;
                    game.drawStackCounter = 0;
                    game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
                }
                break;
            }
            case "block": {
                game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
                game.hasPlayed = false;
                extraInfo = `**${getUsername(game.currentPlayer, true, ctx.guild)}** was skipped`;
                break;
            }
            case "7": {
                if (!game.settings.sevenAndZero) break;

                return ctx.editOriginal({
                    content: "Choose a player",
                    components: PlayerUserSelect(game),
                    flags: MessageFlags.EPHEMERAL
                });
            }
            case "0": {
                if (!game.settings.sevenAndZero) break;
                extraInfo = "All players' cards have been switched!";

                const keys = Object.keys(game.cards);
                keys.unshift(keys.pop());
                if (game.settings.shouldYellBUNO) {
                    for (let i = 0; i < keys.length; i++) {
                        if (game.unoPlayers.includes(keys[i])) {
                            game.unoPlayers.splice(game.unoPlayers.indexOf(keys[i]), 1);
                            game.unoPlayers.push(keys[(i + 1) % keys.length]);
                        }
                    }
                }
                game.cards = Object.fromEntries(Object.entries(game.cards).map(([_, value], i) =>
                    [keys[i], makeDrawCardProxy(value, game, keys[i])]
                ));
                break;
            }
        }

        if (game.settings.allowSkipping) {
            game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
            game.hasPlayed = false;
        }
        ctx.deleteOriginal();
    }

    if (!game.settings.allowSkipping) {
        game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        game.hasPlayed = false;
    }
    game.cards[ctx.member.id].sort((a, b) => cards.indexOf(a) - cards.indexOf(b));

    sendMessage(ctx.channel.id,
        `${cardPlayed === "draw"
            ? `**${getUsername(ctx.member.id, true, ctx.guild)}** drew a card`
            : cardPlayed === "skip"
                ? `**${getUsername(ctx.member.id, true, ctx.guild)}** skipped their turn`
                : `**${getUsername(ctx.member.id, true, ctx.guild)}** played ${cardEmotes[cardPlayed]} ${toTitleCase(cardPlayed)}`}\
        ${extraInfo.length ? `\n${extraInfo}` : ""}`
    );

    if (cardPlayed !== "draw" || !game.settings.allowSkipping) {
        sendGameMessage(game);
    } else {
        timeouts.set(game.channelID, () => onTimeout(game, game.currentPlayer), game.settings.timeoutDuration * 1000);
        games[ctx.message.channel.id] = game;
    }
}
