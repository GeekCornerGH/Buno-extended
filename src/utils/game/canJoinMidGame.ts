import { runningUnoGame } from "../../typings/unoGame.js";
import { maxRejoinableTurnCount } from "../constants.js";

export default (game: runningUnoGame) => {
    return game.settings.canJoinMidgame === "always"
        || (game.settings.canJoinMidgame === "temporarily"
            && game.turnCount <= maxRejoinableTurnCount);
};
