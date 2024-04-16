import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, GuildMember, InteractionEditReplyOptions, User } from "discord.js";

import { Buno } from "../database/models/buno";
import { ButtonIDs } from "../utils/constants";

export default async function (rows: Buno[], interaction: ChatInputCommandInteraction | ButtonInteraction, total: number, offset: number = 0): Promise<InteractionEditReplyOptions> {
    const dataArray = await Promise.all(rows.map(async (r, index) => {
        const rank = (offset * 25) + index + 1;
        let member: GuildMember | User | string = interaction.guild.members.cache.get(r.getDataValue("userId")) as GuildMember;
        if (!member) {
            try {
                member = await interaction.guild.members.fetch(r.getDataValue("userId")) as GuildMember;
            } catch {
                try {
                    member = await interaction.guild.client.users.fetch(r.getDataValue("userId")) as User;
                } catch {
                    member = r.getDataValue("userId");
                }
            }
        }
        const returnData = typeof member === "string" ? member : member.displayName;
        return { rank, member: returnData, wins: r.getDataValue("wins"), losses: r.getDataValue("losses") };
    }));

    const embed = new EmbedBuilder()
        .setTitle(`Leaderboard for **${interaction.guild.name}**`)
        .setColor("Random")
        .setDescription(`Page ${Math.ceil((offset / 25) + 1)} of ${Math.ceil((total + 1) / 25)}.${offset === 0 ? `\nYour rank: ${getMedals(rows.findIndex(p => p.getDataValue("userId") === interaction.user.id), offset)}` : ""}`)
        .setFields(dataArray.map(data => {
            const rankMedal = getMedals(data.rank - 1, offset);
            return {
                name: `${rankMedal + " - "}${data.member}`,
                value: `${data.wins} win${data.wins !== 1 ? "s" : ""}, ${data.losses} loss${data.losses !== 1 ? "es" : ""} ${data.losses === 0 ? "No losses" : (data.wins / data.losses).toFixed(2) + "W/L"}`
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
