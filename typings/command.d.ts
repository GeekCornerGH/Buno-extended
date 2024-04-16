import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { customClient } from "./client";

export type commandFile = { c: command }
export type command = {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder | "addSubcommand">,
    execute: (client: customClient, interaction: ChatInputCommandInteraction) => void;
}
