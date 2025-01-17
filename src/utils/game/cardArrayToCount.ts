import { unoCard } from "../../typings/unoGame.js";
import { cards } from "../constants.js";

export const cardArrayToCount = (a: unoCard[]) => a
    .sort((a, b) => cards.indexOf(a) - cards.indexOf(b))
    .reduce((obj, c) => {
        obj[c] = (obj[c]! + 1) || 1; return obj;
        // eslint-disable-next-line no-unused-vars
    }, {} as { [k in unoCard]?: number; });
