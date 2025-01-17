import { ActivityType } from "discord.js";

interface regularStatus {
    name: string,
    state: ActivityType,
}

interface streamingStatus {
    name: string,
    state: ActivityType.Streaming,
    url: URL
}

export type status = streamingStatus[] | regularStatus[];
