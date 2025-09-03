import { Client, GuildTextBasedChannel, Message, MessageEditOptions } from "discord.js";
import { t } from "i18next";

import runningGameMessage from "../../components/runningGameMessage.js";
import { Buno } from "../../database/models/buno.js";
import { guildRunningGame, runningUnoGame, unoGame, userRunningGame } from "../../typings/unoGame.js";
import { AIPrompt, averageUnoGameCount, defaultSettings, maxPlayerInGame } from "../constants.js";
import { getUsername } from "../getUsername.js";
import timeouts from "../timeoutManager.js";
import { aiPlay } from "./aiPlay.js";
import draw from "./draw.js";
import onTimeout from "./onTimeout.js";
import use from "./use.js";
import generateUsername from "./usernameGenerator.js";

export default async (client: Client, game: unoGame, automatic: boolean, message: Message) => {
    if (!game.guildApp) {
        (game as userRunningGame).previousActions = [];
        game.settings.amountOfAiBots = 0; // AI is a guild-only featuree
    }
    else {
        const botsToAdd = Math.min(game.settings.amountOfAiBots, maxPlayerInGame - game.players.length);
        Array.from({ length: botsToAdd }, () => {
            game.players.push("AI-" + generateUsername());
        });
        if (game.players.filter(p => p.startsWith("AI-")).length > 0) game._modified = true;
    }
    const lng = game.locale;
    if (automatic && game.players.length < 2 && game._modified !== true) {
        client.games.splice(client.games.findIndex(g => g === game), 1);
        const editContent = { content: t("strings:game.noPlayers", { name: await getUsername(client, message.guildId ?? undefined, game.hostId, !game.guildApp), lng }), components: [], embeds: [] } satisfies MessageEditOptions;
        if (game.guildApp) return message.edit(editContent);
        else return game.interaction.editReply(editContent);
    }
    const dbReq = await Buno.findOne({
        where: {
            userId: game.hostId,
            guildId: message.guildId ?? message.channelId
        }
    });
    game.settings = {
        ...defaultSettings,
        ...dbReq?.getDataValue("settings")
    };
    game.state = "inProgress";
    game = game as runningUnoGame;
    game.cards = {};
    game.cardsQuota = {
        ...averageUnoGameCount()
    };
    game.players.forEach(p => {
        game.cards[p] = draw(game.cardsQuota, 7);
    });
    if (game.settings.randomizePlayerList) game.players = shuffleArray(game.players);
    game.playersWhoLeft = [];
    game.turnProgress = "chooseCard";
    game.drawStack = 0;
    game.turnCount = 0;
    game.canSkip = false;
    game.playedCard = undefined;
    game.unoPlayers = [];
    game.saboteurs = {};
    game.adminAbused = false;
    game.messageCount = 0;
    game.currentCard = draw(game.cardsQuota, 1, true)[0];
    use(game, game.currentCard, "0");
    game.log = [{ player: "0", card: game.currentCard, adminAbused: false }];
    game.currentPlayer = game.players[0];
    if (game.guildApp) await message.delete();
    game.startingDate = new Date(Date.now());
    const gameStartMessage = `${t("strings:game.started", { lng })}${game.settings.adminabusemode === true ? "\n" + t("strings:game.startedAA", { lng }) : ""}${(game.guildApp && game.settings.amountOfAiBots > 0) ? "\n" + t("strings:game.aiStart", { lng }) : ""}`;
    let msg: Message;
    const toSend = await runningGameMessage(client, game);
    if (game.guildApp) {
        game.aiConversation = [{
            role: "system",
            content: AIPrompt
        }, {
            role: "assistant",
            content: "OK"
        }];
        await (message.channel as GuildTextBasedChannel).send(gameStartMessage);
        msg = await (message.channel as GuildTextBasedChannel).send(toSend);
    }
    else {
        msg = await game.interaction?.editReply({
            content: gameStartMessage,
            ...toSend as MessageEditOptions
        });
        game.mentionId = (await game.interaction?.followUp({
            content: (game.currentPlayer.startsWith("AI-") ? t("strings:game.ai", { name: await getUsername(client, game.guildId, game.currentPlayer, !game.guildApp) }) : t("strings:game.mention", { mention: `<@${game.currentPlayer}>`, lng })) + `\nhttps://discord.com/channels/${game.interaction.inGuild() ? game.interaction.guildId : "@me"}/${game.channelId}/${game.messageId}`,
        }))?.id;
    }
    game.messageId = msg.id;
    if (game.currentPlayer.startsWith("AI-")) aiPlay(client, game as guildRunningGame);
    else timeouts.set(game.channelId, () => onTimeout(client, game, game.currentPlayer), game.settings.timeoutDuration * 1000);
};

function shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
