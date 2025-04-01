import { ActionRowBuilder, AllowedMentionsTypes, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, MessageCreateOptions, MessageEditOptions, } from "discord.js";
import { t } from "i18next";

import { runningUnoGame } from "../typings/unoGame.js";
import { config } from "../utils/config.js";
import { ButtonIDs, cardEmojis, cardEmotes, coloredUniqueCards, colorEmotes, colors, embedMap, maxActionShownInUserApp, uniqueVariants } from "../utils/constants.js";
import canJoinMidGame from "../utils/game/canJoinMidGame.js";
import generatePlayerList from "../utils/game/generatePlayerList.js";
import toTitleCase from "../utils/game/toTitleCase.js";
import { getUsername } from "../utils/getUsername.js";
import toHumanReadableTime from "../utils/toHumanReadableTime.js";

export default async (client: Client, game: runningUnoGame): Promise<MessageCreateOptions> => {
    const lng = game.locale;
    const isUnique = uniqueVariants.includes(game.currentCard.split("-")[1] as typeof uniqueVariants[number]);
    const currentCardEmote = isUnique ? config.emoteless ? colorEmotes.other : coloredUniqueCards[game.currentCard as keyof typeof coloredUniqueCards] : cardEmotes[game.currentCard];

    const embed = new EmbedBuilder()
        .setTitle("Da Buno!")
        .setColor(embedMap[game.currentCard.split("-")[0] as typeof colors[number]])
        .setThumbnail(`https://cdn.discordapp.com/emojis/${isUnique ? coloredUniqueCards[game.currentCard as keyof typeof coloredUniqueCards].match(/<:\w+:(\d+)>/)![1] : cardEmojis[game.currentCard].match(/<:\w+:(\d+)>/)![1]}.png`)
        .setDescription(`${t("strings:game.message.embed.currentPlayer", { lng, name: await getUsername(client, game.guildId, game.currentPlayer, !game.guildApp) })}\n${t("strings:game.message.embed.currentCard", { lng, currentCardEmote, currentCard: toTitleCase(game.currentCard, lng) })}\n${game.drawStack > 0 ? `${t("strings:game.message.embed.drawStack", { lng, stack: game.drawStack })}\n` : ""}${await generatePlayerList(client, game)} `)
        .setFooter({ text: `${t("strings:game.message.embed.footer.timeout", { lng, timeout: toHumanReadableTime(game.settings.timeoutDuration, lng) })}${game._modified ? ` - ${t("strings:game.lobby.modified", { lng })}.` : ""} \nAll visual assets are owned by Mattel, Inc, and this bot is not affiliated with any of the represented brands.` });

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
        content: game.guildApp ? t("strings:game.mention", { mention: `<@${game.currentPlayer}>`, lng }) : game.previousActions?.slice(-maxActionShownInUserApp).join("\n"),
        allowedMentions: { parse: [AllowedMentionsTypes.User] },
        embeds: [embed],
        components: rows
    } satisfies MessageCreateOptions | MessageEditOptions;
};
