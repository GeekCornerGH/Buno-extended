import { button } from "../../typings/button";
import { ButtonIDs } from "../../utils/constants.js";
import { b as nextBtn } from "./leaderboard_next.js";

export const b: button = {
    name: ButtonIDs.LEADERBOARD_PREVIOUS,
    execute: async (client, interaction) => {
        nextBtn.execute(client, interaction);
    }
};
