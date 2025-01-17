import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions } from "discord.js";
import { t } from "i18next";

import { Buno } from "../database/models/buno.js";
import { ButtonIDs } from "../utils/constants.js";
import { getUsername } from "../utils/getUsername.js";

export default async function (rows: Buno[], interaction: ChatInputCommandInteraction | ButtonInteraction, total: number, offset: number = 0): Promise<InteractionEditReplyOptions> {
    if (!interaction.inGuild()) return {};
    const lng = interaction.locale.split("-")[0];
    const dataArray = await Promise.all(rows.map(async (r, index) => {
        const rank = (offset * 25) + index + 1;
        return { rank, member: await getUsername(interaction.client, interaction.guildId, r.getDataValue("userId")), wins: r.getDataValue("wins"), losses: r.getDataValue("losses") };
    }));

    const embed = new EmbedBuilder()
        .setTitle(t("strings:leaderboard.embed.title", { lng, guild: interaction.guild?.name }))
        .setColor("Random")
        .setDescription(t("strings:leaderboard.embed.description", {
            lng,
            currentPage: Math.ceil((offset / 25) + 1),
            totalPages: Math.ceil((total + 1) / 25),
            userRank: offset === 0 ? t("strings:leaderboard.embed.yourRank", {
                lng,
                rank: getMedals(rows.findIndex(p => p.getDataValue("userId") === interaction.user.id), offset)
            }) : ""
        }))
        .setFields(dataArray.map(data => {
            const rankMedal = getMedals(data.rank - 1, offset);
            return {
                name: t("strings:leaderboard.embed.fieldName", { lng, rank: rankMedal, member: data.member }),
                value: `${t("strings:leaderboard.embed.fieldValues.wins", { lng, count: data.wins })}, ${t("strings:leaderboard.embed.fieldValues.losses", { lng, count: data.losses })}, ${data.losses === 0 ? t("strings:leaderboard.embed.fieldValues.noLoss") : t("strings:leaderboard.embed.fieldValues.wlr", { lng, winLossRatio: parseFloat((data.wins / data.losses).toFixed(2)) })}`
            };
        }))
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents([
            new ButtonBuilder()
                .setCustomId(ButtonIDs.LEADERBOARD_PREVIOUS + `_${(offset / 25) - 1}`)
                .setLabel("<")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(offset < 1),
            new ButtonBuilder()
                .setCustomId(ButtonIDs.LEADERBOARD_NEXT + `_${(offset / 25) + 1}`)
                .setLabel(">")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(Math.ceil((offset / 25) + 1) >= Math.ceil((total + 1) / 25))
        ]);

    return {
        embeds: [embed],
        components: [row]
    };
}

function getMedals(place: number, offset: number) {
    if (offset === 0 && place <= 2) {
        if (place === 0) return "🥇";
        else if (place === 1) return "🥈";
        else if (place === 2) return "🥉";
    }
    return (offset * 25) + place + 1 - (25 * offset);
}
