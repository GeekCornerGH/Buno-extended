import { ActionRowBuilder, AllowedMentionsTypes, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, MessageCreateOptions, } from "discord.js";

import { runningUnoGame } from "../typings/unoGame.js";
import { config } from "../utils/config.js";
import { ButtonIDs, cardEmojis, cardEmotes, coloredUniqueCards, colorEmotes, uniqueVariants } from "../utils/constants.js";
import canJoinMidGame from "../utils/game/canJoinMidGame.js";
import generatePlayerList from "../utils/game/generatePlayerList.js";
import toTitleCase from "../utils/game/toTitleCase.js";
import toHumanReadableTime from "../utils/toHumanReadableTime.js";

export default async (game: runningUnoGame, guild: Guild): Promise<MessageCreateOptions> => {
    const isUnique = uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]);
    const currentCardEmote = isUnique ? config.emoteless ? colorEmotes.other : coloredUniqueCards[`${game.currentCard}`] : cardEmotes[game.currentCard];

    const embed = new EmbedBuilder()
        .setTitle("Let's play Buno!")
        .setColor("Random")
        .setThumbnail(`https://cdn.discordapp.com/emojis/${isUnique ? coloredUniqueCards[`${game.currentCard}`].match(/<:\w+:(\d+)>/)[1] : cardEmojis[game.currentCard].match(/<:\w+:(\d+)>/)[1]}.png`)
        .setDescription(`Currently playing: ** ${guild.members.cache.get(game.currentPlayer).displayName}**\nCurrent card: ${currentCardEmote} ${toTitleCase(game.currentCard)} \n${game.drawStack > 0 ? `${game.drawStack} cards to draw\n` : ""}${await generatePlayerList(game, guild.members)} `)
        .setFooter({ text: `Current timeout is ${toHumanReadableTime(game.settings.timeoutDuration)}.${game._modified ? " - This game won't count towards the leaderboard." : ""} \nAll visual assets are owned by Mattel, Inc, and this bot is not affiliated with any of the represented brands.` });

    const rows: Array<ActionRowBuilder<ButtonBuilder>> = [new ActionRowBuilder<ButtonBuilder>().setComponents([
        new ButtonBuilder().setEmoji("🔍").setCustomId(ButtonIDs.VIEW_CARDS).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setEmoji("🃏").setCustomId(ButtonIDs.PLAY_CARD).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setEmoji("❗").setCustomId(ButtonIDs.ACTIONS_MENU).setStyle(ButtonStyle.Primary).setDisabled(!game.settings.shouldYellBUNO && !game.settings.adminabusemode && !game.settings.allowContest)
    ]),
    new ActionRowBuilder<ButtonBuilder>().setComponents([
        new ButtonBuilder().setEmoji("⚙️").setCustomId(ButtonIDs.VIEW_GAME_SETTINGS).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setEmoji("🚪").setCustomId(ButtonIDs.LEAVE_GAME).setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setEmoji("📥").setCustomId(ButtonIDs.JOIN_MID_GAME).setStyle(ButtonStyle.Primary).setDisabled(!canJoinMidGame(game))
    ])];
    return {
        content: `Hey ${guild.members.cache.get(game.currentPlayer).toString()}, it is now your turn to play.`,
        allowedMentions: { parse: [AllowedMentionsTypes.User] },
        embeds: [embed],
        components: rows
    } as MessageCreateOptions;
};
