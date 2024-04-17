import { StringSelectMenuInteraction } from "discord.js";

import { customClient } from "./client.js";

export type stringSelectFile = { s: stringSelect };
export type stringSelect = {
    name: string,
    execute: (client: customClient, interaction: StringSelectMenuInteraction) => void;
}
