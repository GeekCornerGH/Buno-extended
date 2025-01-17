import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, EmojiResolvable, MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.ADMINABUSE_PANEL,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        else if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.notRunning", { lng }),
            flags: MessageFlags.Ephemeral
        });
        else if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            flags: MessageFlags.Ephemeral
        });
        const actions: {
            emoji: EmojiResolvable,
            name: string,
            description: string,
            id: string,
            style: ButtonStyle
        }[] = [{
            emoji: "👀",
            name: t("strings:game.aa.menu.actions.view.name", { lng }),
            description: t("strings:game.aa.menu.actions.view.value", { lng }),
            id: ButtonIDs.ADMIN_ABUSE_VIEW_CARDS,
            style: ButtonStyle.Primary
        }, {
            emoji: "✏️",
            name: t("strings:game.aa.menu.actions.edit.name", { lng }),
            description: t("strings:game.aa.menu.actions.edit.value", { lng }),
            style: ButtonStyle.Secondary,
            id: ButtonIDs.ADMIN_ABUSE_EDIT_CARDS
        }, {
            emoji: "🃏",
            name: t("strings:game.aa.menu.actions.swap.name", { lng }),
            description: t("strings:game.aa.menu.actions.swap.value", { lng }),
            style: ButtonStyle.Success,
            id: ButtonIDs.ADMIN_ABUSE_SWAP_CARDS
        }];
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle(t("strings:game.aa.menu.embed.title", { lng }))
            .setDescription(t("strings:game.aa.menu.embed.description", { lng }))
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
                                .setEmoji(a.emoji.toString())
                                .setStyle(a.style);
                        })
                    ])
            ]
        });
    }
};
