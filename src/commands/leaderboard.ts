import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import leaderboard from "../components/leaderboard.js";
import { Buno } from "../database/models/buno.js";
import { command } from "../typings/command.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.leaderboard.command.name", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.leaderboard.command.name"))
        .setDescription(t("strings:commands.leaderboard.command.description", { lng: "en" }))
        .setDescriptionLocalizations(generateLocalized("strings:commands.leaderboard.command.description"))
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        await interaction.deferReply();
        const lng = interaction.locale.split("-")[0];
        const cmd = client.application?.commands.cache.find(c => c.name === "uno");
        if (!cmd) return interaction.editReply(t("strings:errors.execution", { lng }));
        const dbReq = await Buno.findAndCountAll({
            where: {
                guildId: interaction.guildId
            },
            order: [["wins", "DESC"]],
            limit: 25,
            offset: 0
        });
        const { count } = dbReq;
        if (dbReq.count === 0) return interaction.editReply(t("strings:commands.leaderboard.message.no-data", { lng, name: cmd.name, id: cmd.id }));
        interaction.editReply(await leaderboard(dbReq.rows, interaction, count));
    }
};
