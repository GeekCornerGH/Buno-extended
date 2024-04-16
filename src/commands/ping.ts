import { SlashCommandBuilder } from "discord.js";

import { command } from "../../typings/command";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDMPermission(false)
        .setDescription("Pong!"),
    execute: async (client, interaction) => {
        const msg = await interaction.reply({
            content: "🏓 Pong!",
            fetchReply: true
        });
        const actualPing = msg.createdTimestamp - interaction.createdTimestamp;
        return await interaction.editReply(`🏓 Pong!\nAPI latency: ${pingToEmote(client.ws.ping)} ${client.ws.ping}ms\nBot latency: ${pingToEmote(actualPing)} ${actualPing}ms`);
    }
};

function pingToEmote(ping: number) {
    if (ping < 350) return ":green_circle:";
    else if (ping >= 350 && ping < 750) return ":orange_circle:";
    else return ":red_circle:";
}
