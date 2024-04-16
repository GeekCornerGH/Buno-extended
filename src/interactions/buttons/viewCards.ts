import { button } from "../../../typings/button";
import { runningUnoGame, unoCard } from "../../../typings/unoGame";
import { config } from "../../utils/config";
import { ButtonIDs, cardEmojis, cardEmotes } from "../../utils/constants";
import { cardArrayToCount } from "../../utils/game/cardArrayToCount";
import digitsToEmotes from "../../utils/game/digitsToEmotes";
import toTitleCase from "../../utils/game/toTitleCase";

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
        const cards = cardArrayToCount(game.cards[interaction.user.id] as unoCard[]);
        const seenCards = [] as unoCard[];
        return interaction.reply({
            content: game.cards[interaction.user.id].map((c: unoCard) => {
                if (seenCards.includes(c)) return undefined;
                seenCards.push(c);
                return `${config.emoteless ? `${cardEmotes[c]} ${toTitleCase(c)}${cards[c] >= 2 ? ` x${cards[c]}` : ""}` : `${cardEmojis[c]}${cards[c] >= 2 ? ` :regional_indicator_x:${digitsToEmotes(cards[c])}` : ""}`}`;
            }).filter(v => v !== undefined).join(config.emoteless ? ", " : " "),
            ephemeral: true
        });

    }
};
