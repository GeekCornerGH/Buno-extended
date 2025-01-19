import { unoCard } from "../../typings/unoGame.js";

export default (cards: unoCard[], currentCard: unoCard) => {
    return cards.filter(c => c.endsWith(currentCard.split("-")[1]) || c.startsWith(currentCard.split("-")[0]));
};
