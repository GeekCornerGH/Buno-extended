import { Client, Collection, DiscordAPIError, Guild, GuildMember, Snowflake } from "discord.js";

export const nameCache = new Collection<`${Snowflake | undefined}_${Snowflake}`, { name: string; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export async function getUsername(client: Client, guildId: Snowflake | undefined, memberId: Snowflake, isUserApp?: boolean): Promise<string> {
    if (memberId.startsWith("AI")) return memberId.split("-")[1] + " 🤖";
    const cachedName = nameCache.get(`${guildId}_${memberId}`);
    if (cachedName && (Date.now() - cachedName.timestamp < CACHE_DURATION || isUserApp)) {
        return cachedName.name;
    }

    if (isUserApp) return await fetchAndCacheUserDisplayName(client, memberId);

    if (!guildId) return ""; // We'll never reach this, as that case only triggers when used as a user app.

    try {
        const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);

        try {
            const member = await fetchMember(guild, memberId);
            const name = member.displayName;
            nameCache.set(`${guildId}_${memberId}`, { name, timestamp: Date.now() });
            return name;
        } catch (memberError) {
            if ((memberError as DiscordAPIError).code === 10007) { // Unknown member error
                return await fetchAndCacheUserDisplayName(client, memberId);
            }
            throw memberError;
        }
    } catch (error) {
        console.error("Error in getUsername:", error);
        return "<Unknown player>";
    }
}

async function fetchMember(guild: Guild, memberId: Snowflake): Promise<GuildMember> {
    return guild.members.cache.get(memberId) || await guild.members.fetch(memberId);
}

async function fetchAndCacheUserDisplayName(client: Client, userId: Snowflake): Promise<string> {
    try {
        const user = client.users.cache.get(userId) || await client.users.fetch(userId);
        const name = user.displayName;
        nameCache.set(`${undefined}_${userId}`, { name, timestamp: Date.now() });
        return name;
    } catch (error) {
        console.error("Error fetching user:", error);
        return "<Unknown player>";
    }
}
