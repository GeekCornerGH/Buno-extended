
import { stringSelect } from "../../../typings/stringSelect.js";
import { SelectIDs } from "../../utils/constants.js";
import { s as play } from "./playCard.js";

export const s: stringSelect = {
    name: SelectIDs.CHOOSE_CARD,
    execute: async (client, interaction) => {
        play.execute(client, interaction);
    }
};
