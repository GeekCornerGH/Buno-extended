import { ModalSubmitInteraction } from "discord.js";

import { customClient } from "./client.js";

export type modalFile = { m: modal }
export type modal = {
    name: string,
    execute: (client: customClient, interaction: ModalSubmitInteraction) => void;
}
