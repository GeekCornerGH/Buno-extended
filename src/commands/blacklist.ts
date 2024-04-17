import { SlashCommandBuilder } from "discord.js";

import { Blacklisted } from "../database/models/blacklisted.js";
import { command } from "../typings/command.js";
import { config } from "../utils/config.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("Manages blacklist")
        .setDMPermission(false)
        .addSubcommand(c =>
            c.setName("add").setDescription("Add someone to the blacklist")
                .addUserOption(o => o.setName("target").setDescription("User to blacklist").setRequired(true))
                .addStringOption(o => o.setName("reason").setDescription("Reason for blacklisting").setMaxLength(1000).setMinLength(5).setRequired(true)
                )
        )
        .addSubcommand(c =>
            c.setName("remove").setDescription("Remove someone from the blacklist")
                .addUserOption(o => o.setName("target").setDescription("User to unblacklist").setRequired(true))),
    execute: async (client, interaction) => {
        if (!config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        const target = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason", false);
        switch (interaction.options.getSubcommand()) {
            case "add":
                if (await Blacklisted.findOne({
                    where: {
                        userId: target.id
                    }
                })) return interaction.reply({
                    content: "This user is already blacklisted",
                    ephemeral: true
                });
                await Blacklisted.create({
                    userId: target.id,
                    reason: reason
                });
                interaction.reply({
                    content: `${target.toString()} has been blacklisted for the reason:\n${reason}`,
                    allowedMentions: { parse: [] }

                });
                break;
            case "remove":
                if (!await Blacklisted.findOne({
                    where: {
                        userId: target.id
                    }
                })) return interaction.reply({
                    content: "This user is not blacklisted",
                    ephemeral: true
                });
                await Blacklisted.destroy({
                    where: {
                        userId: target.id
                    }
                });
                interaction.reply({
                    content: `${target.toString()} has been unblacklisted`,
                    allowedMentions: { parse: [] }
                });
                break;
        }
    }
};
