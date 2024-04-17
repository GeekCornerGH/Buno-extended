import { ActionRowBuilder, ButtonInteraction, InteractionReplyOptions, SelectMenuComponentOptionData, StringSelectMenuBuilder } from "discord.js";

import { customClient } from "../../typings/client.js";
import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { cardEmotes, SelectIDs } from "../utils/constants.js";
import { cardArrayToCount } from "../utils/game/cardArrayToCount.js";
import endGame from "../utils/game/endGame.js";
import endTurn from "../utils/game/endTurn.js";
import next from "../utils/game/next.js";
import toTitleCase from "../utils/game/toTitleCase.js";

export default (client: customClient, interaction: ButtonInteraction, game: runningUnoGame, player: string): InteractionReplyOptions => {
    const playerCards = game.cards[player].filter(c => c === "+4" || c.endsWith("-+2") || (game.settings.reverseAnything === true && c.endsWith("-reverse")));
    const cards = cardArrayToCount(playerCards as unoCard[]);
    const entries: SelectMenuComponentOptionData[] = [
        {
            label: `Draw ${game.drawStack} cards`,
            description: "...and take the L.",
            value: "draw",
            emoji: "🃏",
        },
        ...Object.keys(cards).map(c => {
            return {
                value: c,
                label: `${toTitleCase(c)}${cards[c] >= 2 ? ` x${cards[c]}` : ""}`,
                emoji: cardEmotes[c],
            } as SelectMenuComponentOptionData;
        })
    ];
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
        else return;
    }
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([new StringSelectMenuBuilder()
        .setCustomId(SelectIDs.FORCEFUL_DRAW)
        .setPlaceholder("Choose a card")
        .setOptions(entries.slice(0, 25))
        .setMinValues(1)
        .setMaxValues(1)
    ]);
    return {
        components: [row],
        content: "You have to respond, or draw " + game.drawStack + " cards."
    };
};
