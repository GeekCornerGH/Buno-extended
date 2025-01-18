import { ActionRowBuilder, ButtonInteraction, Client, InteractionReplyOptions, SelectMenuComponentOptionData, StringSelectMenuBuilder } from "discord.js";
import { t } from "i18next";

import { runningUnoGame, unoCard } from "../typings/unoGame.js";
import { cardEmotes, SelectIDs } from "../utils/constants.js";
import { cardArrayToCount } from "../utils/game/cardArrayToCount.js";
import endGame from "../utils/game/endGame.js";
import endTurn from "../utils/game/endTurn.js";
import next from "../utils/game/next.js";
import toTitleCase from "../utils/game/toTitleCase.js";
import { getUsername } from "../utils/getUsername.js";

export default async (client: Client, interaction: ButtonInteraction, game: runningUnoGame, player: string): Promise<InteractionReplyOptions> => {
    const lng = game.locale;
    if (!interaction.inGuild()) return { content: "This shouldn't happen" };
    const playerCards = game.cards[player].filter(c => c === "+4" || c.endsWith("-+2") || (game.settings.reverseAnything === true && c.endsWith("-reverse")));
    const cards = cardArrayToCount(playerCards as unoCard[]);
    const entries: SelectMenuComponentOptionData[] = [
        {
            label: t("strings:game.forceDraw.select.title", { lng, stack: game.drawStack }),
            description: t("strings:game.forceDraw.select.description", { lng }),
            value: "draw",
            emoji: "🃏",
        },
        ...Object.keys(cards).map(c => {
            const card = c as unoCard;
            return {
                value: card,
                label: `${toTitleCase(c, lng)}${cards[card]! >= 2 ? ` x${cards[card]!}` : ""}`,
                emoji: cardEmotes[card],
            } as SelectMenuComponentOptionData;
        })
    ];
    if (entries.length > 50) {
        game.players.splice(game.players.indexOf(player), 1);
        if (game.currentPlayer === player) game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        delete game.cards[player];
        game.playersWhoLeft.push(player);
        endTurn(client, game, interaction, player, "misc", t("strings:game.tooManyCards", { lng, name: await getUsername(client, interaction.guildId, player) }), false);
        game.canSkip = false;
        if (game.players.length === 1) {
            endGame(game, client, "notEnoughPeople", game.players[0]);
            return {};
        }
        else return {};
    }
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([new StringSelectMenuBuilder()
        .setCustomId(SelectIDs.FORCEFUL_DRAW)
        .setPlaceholder(t("strings:game.forceDraw.select.placeholder", { lng }))
        .setOptions(entries.slice(0, 25))
        .setMinValues(1)
        .setMaxValues(1)
    ]);
    return {
        components: [row],
        content: t("strings:game.forceDraw.text", { lng })
    };
};
