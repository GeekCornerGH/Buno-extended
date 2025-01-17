import { ActionRowBuilder, ButtonInteraction, Client, InteractionReplyOptions, SelectMenuComponentOptionData, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { t } from "i18next";

import { runningUnoGame, unoCard } from "../typings/unoGame.js";
import { config } from "../utils/config.js";
import { cardEmojis, cardEmotes, SelectIDs } from "../utils/constants.js";
import { cardArrayToCount } from "../utils/game/cardArrayToCount.js";
import endGame from "../utils/game/endGame.js";
import endTurn from "../utils/game/endTurn.js";
import next from "../utils/game/next.js";
import toTitleCase from "../utils/game/toTitleCase.js";
import { getUsername } from "../utils/getUsername.js";

export default async (client: Client, interaction: ButtonInteraction | StringSelectMenuInteraction, game: runningUnoGame, player: string, canSkip: boolean = false, showCard?: unoCard): Promise<InteractionReplyOptions> => {
    const lng = game.locale;
    const cards = cardArrayToCount(game.cards[player]);
    const entries: SelectMenuComponentOptionData[] = [
        ...Object.keys(cards).map(c => {
            const card = c as unoCard;
            return {
                value: card,
                label: `${toTitleCase(card, lng)}${cards[card]! >= 2 ? ` x${cards[card]}` : ""}`,
                emoji: cardEmotes[card],
            } as SelectMenuComponentOptionData;
        }),
        {
            label: t("strings:game.draw.select.draw", { lng }),
            value: "draw",
            emoji: "🃏",
        }
    ];
    if (game.settings.allowSkipping && canSkip) entries.push({
        label: t("strings:game.draw.select.skip", { lng }),
        value: "skip",
        emoji: "➡"
    });
    if (entries.length > 50) {
        game.players.splice(game.players.indexOf(player), 1);
        if (game.currentPlayer === player) game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer));
        delete game.cards[player];
        game.playersWhoLeft.push(player);
        endTurn(client, game, interaction, player, "misc", t("strings:game.tooManyCards", { lng, name: await getUsername(client, game.guildId, player) }), false);
        if (game.players.length === 1) {
            endGame(game, client, "notEnoughPeople", game.players[0]);
        }
        return {};
    }
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([new StringSelectMenuBuilder()
        .setCustomId(SelectIDs.CHOOSE_CARD)
        .setPlaceholder(t("strings:game.forceDraw.select.placeholder", { lng }))
        .setOptions(entries.slice(0, 25))
        .setMinValues(1)
        .setMaxValues(1)
    ]);
    const row2 = new ActionRowBuilder<StringSelectMenuBuilder>();
    if (entries.length > 25) row2.addComponents([
        new StringSelectMenuBuilder()
            .setCustomId(SelectIDs.CHOOSE_CARD_ABOVE_25)
            .setPlaceholder(t("strings:game.forceDraw.select.placeholder", { lng }))
            .setOptions(entries.slice(25))
            .setMinValues(1)
            .setMaxValues(1)]);
    const toPush = [row];
    if (entries.length > 25) toPush.push(row2);
    return {
        components: toPush,
        content: game.cards[player].map(c => {
            const card = c as unoCard;
            return config.emoteless
                ? `${cardEmotes[card]} ${toTitleCase(c, lng)}`
                : `${cardEmojis[card]}`;
        }).join(config.emoteless ? ", " : " ") +
            (showCard ? `\n${t("strings:game.draw.ephemeral", { lng, card: `${cardEmotes[showCard]} ${toTitleCase(showCard, lng)}` })}` : "")
    };
};
