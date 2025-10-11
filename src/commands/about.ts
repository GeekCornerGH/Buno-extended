import { ActionRowBuilder, ApplicationIntegrationType, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionContextType, SlashCommandBuilder, version as djsVersion } from "discord.js";
import i18next, { t } from "i18next";

import { command } from "../typings/command.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";
import toHumanReadableTime from "../utils/toHumanReadableTime.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.about.command.name", { lng: "en" }))
        .setDescription(t("strings:commands.about.command.description", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.about.command.name"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.about.command.description"))
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
    execute: (client, interaction) => {
        const lng = interaction.locale.split("-")[0];
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(t("strings:commands.about.message.title", { lng }))
                    .setDescription(t("strings:commands.about.message.description", { lng }))
                    .setFields([
                        {
                            name: t("strings:commands.about.message.node", { lng }),
                            value: `Node.JS v${process.versions.node}`
                        },
                        {
                            name: t("strings:commands.about.message.discordjs", { lng }),
                            value: `Discord.JS v${djsVersion}`
                        },
                        {
                            name: t("strings:commands.about.message.uptime-title", { lng }),
                            value: t("strings:commands.about.message.uptime-desc", { lng, duration: toHumanReadableTime(Math.round(process.uptime()), lng), date: `<t:${Math.round((Date.now() / 1000) - (client.uptime/1000) ?? 0)}:D>`, time: `<t:${Math.round((Date.now() / 1000) - client.uptime/1000)}:T>` })
                        },
                        {
                            name: t("strings:commands.about.message.stats-title", { lng }),
                            value: `${t("strings:words.servers", { lng, count: client.guilds.cache.size })}, ${i18next.t("strings:words.channels", { lng, count: client.channels.cache.size })}, ${i18next.t("strings:words.and", { lng })} ${i18next.t("strings:words.users", { lng, count: client.users.cache.size })}.`
                        },
                        {
                            name: t("strings:commands.about.message.invite-title", { lng }),
                            value: t("strings:commands.about.message.invite-desc", { lng })
                        }
                    ])
                    .setTimestamp()
                    .setColor("Random")
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents([
                        new ButtonBuilder()
                            .setLabel(t("strings:commands.about.message.sourcecode", { lng }))
                            .setEmoji("📂")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://github.com/GeekCornerGH/Huno-Extended"),
                        new ButtonBuilder()
                            .setLabel(t("strings:commands.about.message.invitebot", { lng }))
                            .setEmoji("🔗")
                            .setStyle(ButtonStyle.Link)
                            .setURL("https://link.geekcorner.eu.org/invite-buno")
                    ])
            ]
        });
    }
};
