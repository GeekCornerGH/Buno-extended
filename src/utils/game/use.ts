import { runningUnoGame, unoCard } from "../../../typings/unoGame";

export default (game: runningUnoGame, card: unoCard, player: string) => {
    game.cardsQuota[card] += 1;
    if (player === "0") return;
    const index = game.cards[player].findIndex(c => c === card);
    game.cards[player].splice(index, 1);

};
