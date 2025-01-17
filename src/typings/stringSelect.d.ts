import { Client, StringSelectMenuInteraction } from "discord.js";

export type stringSelectFile = { s: stringSelect };
export type stringSelect = {
    name: string,
    // eslint-disable-next-line no-unused-vars
    execute: (client: Client, interaction: StringSelectMenuInteraction) => void;
}
