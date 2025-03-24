import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, InteractionUpdateOptions, MessageCreateOptions } from "discord.js";
import { t } from "i18next";

import { waitingUnoGame } from "../typings/unoGame.js";
import { ButtonIDs } from "../utils/constants.js";
import generatePlayerList from "../utils/game/generatePlayerList.js";
import { getUsername } from "../utils/getUsername.js";

export default async (client: Client, game: waitingUnoGame): Promise<MessageCreateOptions | InteractionUpdateOptions> => {
    const lng = game.locale;
    const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("Da Buno!")
        .setDescription(t("strings:game.lobby.body", {
            timer: `<t:${Math.round(game.startsAt / 1000)}:R>`,
            host: await getUsername(client, game.guildId, game.hostId, !game.guildApp),
            playerList: await generatePlayerList(client, game),
            lng
        }));
    if (game._modified) embed.setFooter({ text: t("strings:game.lobby.modified") });
    return {
        embeds: [embed],
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
                    new ButtonBuilder().setLabel("​").setStyle(ButtonStyle.Link).setURL("https://github.com/GeekCornerGH/Buno-Extended")
                ]
            )
        ]
    } as InteractionUpdateOptions;
};
