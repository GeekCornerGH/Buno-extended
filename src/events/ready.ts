import { ActivityType, PresenceUpdateStatus } from "discord.js";

import { customClient } from "../typings/client.js";
import { event } from "../typings/event.js";
import { status, streamingStatus } from "../typings/statuses.js";

export const e: event = async client => {
    if (!client.user) return;
    await client.application.commands.fetch();
    console.log(`Logged in as ${client.user.tag}`);
    setStatus(client);
    setInterval(() => setStatus(client), 1 * 60 * 1000);
    return;
};

function setStatus(client: customClient) {
    const statuses = [{
        name: "Buno",
        state: ActivityType.Playing
    }, {
        name: "Buno games",
        state: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }, {
        name: `${client.games.length} game${client.games.length > 1 ? "s" : ""}`,
        state: ActivityType.Watching
    }, {
        name: "Bunofficial!",
        state: ActivityType.Custom
    }, {
        name: "As seen on TV!",
        state: ActivityType.Custom
    }, {
        name: "Awesome!",
        state: ActivityType.Custom
    }, {
        name: "Limited edition!",
        state: ActivityType.Custom
    }, {
        name: "One of a kind!",
        state: ActivityType.Custom
    }, {
        name: "Check it out!",
        state: ActivityType.Custom
    }, {
        name: "It's a game!",
        state: ActivityType.Custom
    }, {
        name: "Try it!",
        state: ActivityType.Custom
    }, {
        name: "Random status!",
        state: ActivityType.Custom
    }, {
        name: "Nice to meet you!",
        state: ActivityType.Custom
    }, {
        name: "Very fun!",
        state: ActivityType.Custom
    }, {
        name: "Open source!",
        state: ActivityType.Custom
    },] as status;
    const random = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setPresence({ status: client.games.length === 0 ? PresenceUpdateStatus.Idle : PresenceUpdateStatus.Online, activities: [{ name: random.name, type: random.state, url: random.state === ActivityType.Streaming ? (random as streamingStatus).url.toString() : undefined }] });
    return;
}
