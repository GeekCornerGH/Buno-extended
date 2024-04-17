import { SlashCommandBuilder } from "discord.js";

import { command } from "../../typings/command.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("blocklist")
        .setDescription("Manages blacklist")
        .setDMPermission(false)
        .addSubcommand(c =>
            c.setName("add").setDescription("Add someone to the blacklist")
                .addUserOption(o => o.setName("target").setDescription("User to blacklist").setRequired(true))
                .addStringOption(o => o.setName("reason").setDescription("Reason for blacklisting").setMaxLength(1000).setMinLength(5).setRequired(true)
                )
        ),
    execute: async (client, interaction) => {
        const target = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason", false);
        switch (interaction.options.getSubcommand()) {
            case "add":
                interaction.reply({
                    content: `${target.toString()} has been blacklisted for the reason:\n${reason}`,
                    allowedMentions: { parse: [] }
                });
                break;
        }
    }
};
