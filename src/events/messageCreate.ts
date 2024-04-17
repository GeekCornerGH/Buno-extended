import { Message } from "discord.js";

import { event } from "../../typings/event.js";
import runningGameMessage from "../components/runningGameMessage.js";
import { maxWeightBeforeResend } from "../utils/constants.js";


export const e: event = async (client, message: Message) => {
    if (message.author.bot || message.webhookId) return;
    const commandMap: {
        [oldCmd: string]: string
    } = {
        "uno": "uno",
        "eval": "eval",
        "adminabuse": "eval",
        "lb": "leaderboard"
    };
    const cmd = message.content.split(" ")[0].substring(1);
    if (commandMap[cmd]) {
        const slashCmd = client.application.commands.cache.find(c => c.name === commandMap[cmd]);
        if (!slashCmd) return;
        return message.reply(`Hey! This bot is now running Buno v2. All commands are now using Discord's slash commands. To run the command you meant, please run </${slashCmd.name}:${slashCmd.id}>`);
    }
    else {
        const game = client.games.find(g => g.channelId === message.channelId);
        if (!game || !game.settings.resendGameMessage) return;
        if (game.state === "waiting") return;
        const scrolledWeight = message.channel.messages.cache.filter(m => BigInt(m.id) > BigInt(game.messageId)).reduce((weight, msg2) => (msg2.content.length > 800 || msg2.attachments.size > 0 || msg2.embeds.length ? 2 : 1) + weight, 0);
        if (scrolledWeight > maxWeightBeforeResend) {
            const msg = message.channel.messages.cache.get(game.messageId);
            await msg.delete();
            const sent = await msg.channel.send(await runningGameMessage(game, message.guild));
            game.messageId = sent.id;
        }
    }
};
