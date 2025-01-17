import { Client, DiscordAPIError, Guild, GuildMember, Snowflake, } from "discord.js";

const nonExistentMemberCache = new Map<Snowflake, boolean>();
const CACHE_DURATION = 30000; // 30 seconds

export async function getUsername(client: Client, guildId: Snowflake, memberId: Snowflake): Promise<string> {
    try {
        // Fetch guild
        const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);

        // Check if member is cached as non-existent
        if (nonExistentMemberCache.has(memberId)) {
            return await fetchUserDisplayName(client, memberId);
        }

        // Attempt to fetch member
        try {
            const member = await fetchMember(guild, memberId);
            return member.displayName;
        } catch (memberError) {
            if ((memberError as DiscordAPIError).code === 10007) { // Unknown member error
                nonExistentMemberCache.set(memberId, true);
                setTimeout(() => nonExistentMemberCache.delete(memberId), CACHE_DURATION);
            }
            return await fetchUserDisplayName(client, memberId);
        }
    } catch (error) {
        console.error("Error in getUsername:", error);
        return "<Unknown player>";
    }
}

async function fetchMember(guild: Guild, memberId: Snowflake): Promise<GuildMember> {
    return guild.members.cache.get(memberId) || await guild.members.fetch(memberId);
}

async function fetchUserDisplayName(client: Client, userId: Snowflake): Promise<string> {
    try {
        const user = client.users.cache.get(userId) || await client.users.fetch(userId);
        return user.displayName;
    } catch (error) {
        console.error("Error fetching user:", error);
        return "<Unknown player>";
    }
}
