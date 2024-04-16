import { EmbedBuilder, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";

import { command } from "../../typings/command";
import { config } from "../utils/config";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stops the game")
        .setDMPermission(false),
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!config.developerIds.includes(interaction.user.id) && (interaction.member.permissions as PermissionsBitField).has(PermissionFlagsBits.ManageMessages)) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        if (!game) return interaction.reply({
            content: "Couldn't find the game you're talking about.",
            ephemeral: true
        });
        if (game.state !== "waiting") return interaction.reply({
            content: "The game is in progress",
            ephemeral: true
        });
        if (!interaction.guild.members.cache.get(interaction.user.id).permissions.has(PermissionFlagsBits.ManageMessages) && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: "You are not allowed to stop the game.",
            ephemeral: true
        });
        await interaction.deferReply({
            ephemeral: true
        });
        const msg = interaction.channel.messages.cache.get(game.messageId);
        if (msg) await msg.delete();
        client.games.splice(client.games.findIndex(g => g === game), 1);
        interaction.channel.send({
            content: `${interaction.user.toString()} has stopped the game`,
            embeds: [new EmbedBuilder()
                .setColor("Red")
                .setImage("https://media.tenor.com/TuaZhZCF4HQAAAAi/lucosgif.gif")
            ]
        });
        await interaction.deleteReply();
    }
};
