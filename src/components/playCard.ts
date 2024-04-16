import { ActionRowBuilder, ButtonInteraction, InteractionReplyOptions, SelectMenuComponentOptionData, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";

import { customClient } from "../../typings/client";
import { runningUnoGame, unoCard } from "../../typings/unoGame";
import { config } from "../utils/config";
import { cardEmojis, cardEmotes, SelectIDs } from "../utils/constants";
import { cardArrayToCount } from "../utils/game/cardArrayToCount";
import digitsToEmotes from "../utils/game/digitsToEmotes";
import endGame from "../utils/game/endGame";
import endTurn from "../utils/game/endTurn";
import next from "../utils/game/next";
import toTitleCase from "../utils/game/toTitleCase";

export default (client: customClient, interaction: ButtonInteraction | StringSelectMenuInteraction, game: runningUnoGame, player: string, canSkip: boolean = false, showCard?: unoCard): InteractionReplyOptions => {
    const seenCards: unoCard[] = [];
    const cards = cardArrayToCount(game.cards[player] as unoCard[]);
    const entries: SelectMenuComponentOptionData[] = [
        ...Object.keys(cards).map(c => {
            return {
                value: c,
                label: `${toTitleCase(c)}${cards[c] >= 2 ? ` x${cards[c]}` : ""}`,
                emoji: cardEmotes[c],
            } as SelectMenuComponentOptionData;
        }),
        {
            label: "Draw a card",
            value: "draw",
            emoji: "🃏",
        }
    ];
    if (game.settings.allowSkipping && canSkip) entries.push({
        label: "Skip your turn",
        value: "skip",
        emoji: "➡"
    });
    if (entries.length > 50) {
        game.players.splice(game.players.indexOf(player), 1);
        if (game.currentPlayer === player) game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        delete game.cards[player];
        game.playersWhoLeft.push(player);
        endTurn(client, game, interaction, player, "misc", `Removed **${client.guilds.cache.get(game.guildId).members.cache.get(player).displayName}** for abusing the game.`, false);
        if (game.players.length === 1) {
            endGame(game, client, "notEnoughPeople", game.players[0]);
            return {};
        }
        else return {};
    }
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([new StringSelectMenuBuilder()
        .setCustomId(SelectIDs.CHOOSE_CARD)
        .setPlaceholder("Choose a card")
        .setOptions(entries.slice(0, 25))
        .setMinValues(1)
        .setMaxValues(1)
    ]);
    const row2 = new ActionRowBuilder<StringSelectMenuBuilder>();
    if (entries.length > 25) row2.addComponents([
        new StringSelectMenuBuilder()
            .setCustomId(SelectIDs.CHOOSE_CARD_ABOVE_25)
            .setPlaceholder("Choose a card")
            .setOptions(entries.slice(25))
            .setMinValues(1)
            .setMaxValues(1)]);
    const toPush = [row];
    if (entries.length > 25) toPush.push(row2);
    return {
        components: toPush,
        content: game.cards[player].map((c: unoCard) => {
            if (seenCards.includes(c)) return undefined;
            seenCards.push(c);
            return `${config.emoteless ? `${cardEmotes[c]} ${toTitleCase(c)}${cards[c] >= 2 ? ` x${cards[c]}` : ""}` : `${cardEmojis[c]}${cards[c] >= 2 ? ` :regional_indicator_x:${digitsToEmotes(cards[c])}` : ""}`}`;
        }).filter((v: unoCard | undefined) => v !== undefined).join(config.emoteless ? ", " : " ") + (showCard ? `\nYou drew: ${cardEmotes[showCard]} ${toTitleCase(showCard)}` : "")
    };
};
