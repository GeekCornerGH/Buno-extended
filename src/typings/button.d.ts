import { ButtonInteraction, Client } from "discord.js";

export type buttonFile = { b: button }
export type button = {
    name: string,
    // eslint-disable-next-line no-unused-vars
    execute: (client: Client, interaction: ButtonInteraction) => void;
}
