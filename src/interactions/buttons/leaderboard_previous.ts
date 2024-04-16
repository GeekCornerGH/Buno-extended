import { button } from "../../../typings/button";
import { ButtonIDs } from "../../utils/constants";
import { b as nextBtn } from "./leaderboard_next";

export const b: button = {
    name: ButtonIDs.LEADERBOARD_PREVIOUS,
    execute: async (client, interaction) => {
        nextBtn.execute(client, interaction);
    }
};
