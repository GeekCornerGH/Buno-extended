import { Client, Snowflake } from "discord.js";

export async function getUsername(client: Client, guildId: Snowflake, memberId: Snowflake) {
    let guild = client.guilds.cache.get(guildId);
    if (!guild) guild = await client.guilds.fetch(guildId);
    let member = guild.members.cache.get(memberId);
    if (!member) member = await guild.members.fetch(memberId);
    if (member) return member.displayName;
    let user = client.users.cache.get(memberId);
    if (!user) user = await client.users.fetch(memberId);
    if (!user) return "<Unknown player>";
    return user.displayName;
}
