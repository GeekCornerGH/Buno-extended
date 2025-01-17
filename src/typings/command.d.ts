import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";

export type commandFile = { c: command }
export type command = {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder | "addSubcommand">,
    // eslint-disable-next-line no-unused-vars
    execute: (client: Client, interaction: ChatInputCommandInteraction) => void;
}
