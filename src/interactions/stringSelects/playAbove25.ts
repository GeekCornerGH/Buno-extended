
import { stringSelect } from "../../../typings/stringSelect";
import { SelectIDs } from "../../utils/constants";
import { s as play } from "./playCard";

export const s: stringSelect = {
    name: SelectIDs.CHOOSE_CARD,
    execute: async (client, interaction) => {
        play.execute(client, interaction);
    }
};
