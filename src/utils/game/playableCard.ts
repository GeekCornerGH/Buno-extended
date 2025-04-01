import { runningUnoGame, unoCard } from "../../typings/unoGame.js";

export default function playableCards(cards: unoCard[], currentCard: unoCard, game: runningUnoGame) {
    return game.drawStack > 0 && game.settings.allowStacking ? cards.filter(c => c === "+4" || c === "wild" || (game.currentCard.endsWith("-+2") && c.endsWith("-+2")) || game.settings.reverseAnything && c === `${game.currentCard.split("-")[0]}-reverse`) : cards.filter(c => c.endsWith(currentCard.split("-")[1]) || c.startsWith(currentCard.split("-")[0]) || c === "+4" || c === "wild");
}
