import { SlashCommandBuilder } from "discord.js";

import leaderboard from "../components/leaderboard.js";
import { Buno } from "../database/models/buno.js";
import { command } from "../typings/command.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Show top players")
        .setDMPermission(true),
    execute: async (client, interaction) => {
        await interaction.deferReply();
        const cmd = client.application.commands.cache.find(c => c.name === "uno");
        if (!cmd) return interaction.editReply("An error occured while executing this command.");
        const dbReq = await Buno.findAndCountAll({
            order: [["wins", "DESC"]],
            limit: 25,
            offset: 0
        });
        const count = await Buno.count();
        if (dbReq.count === 0) return interaction.editReply(`No one played Buno in this channel! Run </${cmd.name}:${cmd.id}> to start a new game.`);
        interaction.editReply(await leaderboard(dbReq.rows, interaction, count));
    }
};
