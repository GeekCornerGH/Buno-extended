import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, EmojiResolvable } from "discord.js";

import { button } from "../../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.ADMINABUSE_PANEL,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!game) return interaction.reply({
            content: "Cannot find the game you're talking about.",
            ephemeral: true
        });
        else if (game.state === "waiting") return interaction.reply({
            content: "The game hasn't started yet.",
            ephemeral: true
        });
        else if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: "This is not your turn.",
            ephemeral: true
        });
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        const actions: {
            emoji: EmojiResolvable,
            name: string,
            description: string,
            id: string,
            style: ButtonStyle
        }[] = [{
            emoji: "👀",
            name: "View cards",
            description: "Check out the cards of another player",
            id: ButtonIDs.ADMIN_ABUSE_VIEW_CARDS,
            style: ButtonStyle.Primary
        }, {
            emoji: "✏️",
            name: "Edit cards",
            description: "Edit the cards of someone else",
            style: ButtonStyle.Secondary,
            id: ButtonIDs.ADMIN_ABUSE_EDIT_CARDS
        }, {
            emoji: "🃏",
            name: "Swap cards",
            description: "Swap cards between 2 players",
            style: ButtonStyle.Success,
            id: ButtonIDs.ADMIN_ABUSE_SWAP_CARDS
        }];
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Admin abuse panel")
            .setDescription("Select what action you'd like to do.")
            .setFields(actions.map(a => {
                return {
                    name: `${a.emoji} - ${a.name}`,
                    value: a.description
                };
            }));
        return interaction.editReply({
            embeds: [embed],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .setComponents([
                        ...actions.map(a => {
                            return new ButtonBuilder()
                                .setCustomId(a.id)
                                .setEmoji(a.emoji)
                                .setStyle(a.style);
                        })
                    ])
            ]
        });
    }
};
