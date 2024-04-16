import { runningUnoGame } from "../../../typings/unoGame";
import { maxRejoinableTurnCount } from "../constants";

export default (game: runningUnoGame) => {
    return game.settings.canJoinMidgame === "always" || (game.settings.canJoinMidgame === "temporarily" && game.turnCount <= maxRejoinableTurnCount);
};
