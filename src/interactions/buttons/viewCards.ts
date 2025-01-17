import { button } from "../../typings/button.js";
import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { config } from "../../utils/config.js";
import { ButtonIDs, cardEmojis, cardEmotes } from "../../utils/constants.js";
import { cardArrayToCount } from "../../utils/game/cardArrayToCount.js";
import toTitleCase from "../../utils/game/toTitleCase.js";

export const b: button = {
    name: ButtonIDs.VIEW_CARDS,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id) as runningUnoGame;
        if (!game) return interaction.reply({
            content: "No game is currently running.",
            ephemeral: true,
        });
        if (!game.players.includes(interaction.user.id)) return interaction.reply({
            content: "You're not part of the game.",
            ephemeral: true,
        });
        const lng = game.locale;
        const cards = cardArrayToCount(game.cards[interaction.user.id] as unoCard[]);
        const seenCards = [] as unoCard[];
        return interaction.reply({
            content: game.cards[interaction.user.id].map(card => {
                const c = card as unoCard;
                if (seenCards.includes(c)) return undefined;
                seenCards.push(c);
                return `${config.emoteless ? `${cardEmotes[c]} ${toTitleCase(c, lng)}${cards[c]! >= 2 ? ` x${cards[c]}` : ""}` : `${cardEmojis[c]}${cards[c]! >= 2 ? ` x${cards[c]!}` : ""}`}` as unoCard;
            }).filter(v => v !== undefined).join(config.emoteless ? ", " : " "),
            ephemeral: true
        });

    }
};
