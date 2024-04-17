import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, version as djsVersion } from "discord.js";

import { command } from "../typings/command.js";
import toHumanReadableTime from "../utils/toHumanReadableTime.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("About me")
        .setDMPermission(false),
    execute: (client, interaction) => {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Hi, I'm Buno")
                    .setDescription("I'm a bot attempting to recreate Uno:tm:, the well known card game from Mattel, Inc. All assets are owned by this company.")
                    .setFields([
                        {
                            name: "I'm currently running on",
                            value: `Node.JS v${process.versions.node}`
                        },
                        {
                            name: "I'm powered by",
                            value: `Discord.JS v${djsVersion}`
                        },
                        {
                            name: "I've been running for",
                            value: `${toHumanReadableTime(Math.round(process.uptime()))} (since <t:${Math.round((Date.now() / 1000) - process.uptime())}:D> <t:${Math.round((Date.now() / 1000) - process.uptime())}:T>)`
                        },
                        {
                            name: "I'm watching",
                            value: `** ${client.guilds.cache.size} ** servers, ** ${client.channels.cache.size} ** channels, and ** ${client.users.cache.size} ** users.`
                        },
                        {
                            name: "Want to invite me?",
                            value: "Sorry, you probably can't. This bot is private, and is not hosted on a powerful server. It would get rate-limited quite quickly too.\nThe only way to get it on your server is to be friend with either the guy who's hosting the bot (add him, his username is ||REDACTED||. Or be friend with the current developer.\n Oh wait nvm, maybe click the invite button below?"
                        }
                    ])
                    .setTimestamp()
                    .setColor("Random")
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents([
                        new ButtonBuilder()
                            .setLabel("Source code")
                            .setEmoji("📂")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://github.com/GeekCornerGH/buno-extended"),
                        new ButtonBuilder()
                            .setLabel("Invite the bot")
                            .setEmoji("🔗")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://link.geekcorner.eu.org/invite-buno")
                    ])
            ]
        });
    }
};
