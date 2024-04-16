import { ButtonInteraction } from "discord.js";

import { customClient } from "./client";

export type buttonFile = { b: button }
export type button = {
    name: string,
    execute: (client: customClient, interaction: ButtonInteraction) => void;
}
