import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, InteractionUpdateOptions, MessageCreateOptions } from "discord.js";

import { unoGame } from "../typings/unoGame.js";
import { autoStartTimeout, ButtonIDs } from "../utils/constants.js";
import generatePlayerList from "../utils/game/generatePlayerList.js";

export default async (game: unoGame, guild: Guild): Promise<MessageCreateOptions | InteractionUpdateOptions> => {
    return {
        embeds: [new EmbedBuilder().setColor("Random").setTitle("Let's play Buno!").setDescription(`Game will start automatically <t:${Math.round((Date.now() / 1000) + autoStartTimeout)}:R>\nCurrent game host: ${guild.members.cache.get(game.hostId)}\n${await generatePlayerList(game, guild.members)}`).setFooter({ text: game._modified ? "This game won't count towards the game leaderboard" : null })],
        components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
                [
                    new ButtonBuilder().setEmoji("📥").setStyle(ButtonStyle.Primary).setCustomId(ButtonIDs.JOIN_GAME),
                    new ButtonBuilder().setEmoji("🚪").setStyle(ButtonStyle.Danger).setCustomId(ButtonIDs.LEAVE_GAME_BEFORE_START),
                    new ButtonBuilder().setEmoji("▶️").setStyle(ButtonStyle.Primary).setCustomId(ButtonIDs.START_GAME)
                ]
            ),
            new ActionRowBuilder<ButtonBuilder>().setComponents(
                [
                    new ButtonBuilder().setEmoji("🛑").setStyle(ButtonStyle.Danger).setCustomId(ButtonIDs.DELETE_GAME),
                    new ButtonBuilder().setEmoji("⚙️").setStyle(ButtonStyle.Secondary).setCustomId(ButtonIDs.EDIT_GAME_SETTINGS),
                    new ButtonBuilder().setLabel("​").setStyle(ButtonStyle.Link).setURL("https://github.com/geekcornergh/buno-extended")
                ]
            )
        ]
    };
};
