import { Guild, GuildTextBasedChannel, Message } from "discord.js";

import runningGameMessage from "../components/runningGameMessage.js";
import { event } from "../typings/event.js";
import { maxWeightBeforeResend } from "../utils/constants.js";


export const e: event = async (client, message: Message) => {
    if (message.author.bot || message.webhookId) return;
    const game = client.games.find(g => g.channelId === message.channelId);
    if (!game || !game.settings.resendGameMessage) return;
    if (game.state === "waiting") return;
    const scrolledWeight = message.channel.messages.cache.filter(m => BigInt(m.id) > BigInt(game.messageId)).reduce((weight, msg2) => (msg2.content.length > 800 || msg2.attachments.size > 0 || msg2.embeds.length ? 2 : 1) + weight, 0);
    if (scrolledWeight > maxWeightBeforeResend) {
        const msg = message.channel.messages.cache.get(game.messageId);
        if (msg) await msg?.delete();
        const sent = await (msg?.channel as GuildTextBasedChannel).send(await runningGameMessage(client, game, message.guild as Guild));
        game.messageId = sent.id;
    }
};
