import { Client, ModalSubmitInteraction } from "discord.js";

export type modalFile = { m: modal }
export type modal = {
    name: string,
    // eslint-disable-next-line no-unused-vars
    execute: (client: Client, interaction: ModalSubmitInteraction) => void;
}
