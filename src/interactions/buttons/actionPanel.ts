import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

import { button } from "../../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.ACTIONS_MENU,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
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
        else if (!game.settings.adminabusemode && !game.settings.shouldYellBUNO && !game.settings.allowContest) return interaction.reply({
            content: "The Actions menu isn't used for this game.",
            ephemeral: true
        });
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Actions menu")
            .setDescription("Need something else than just view or play cards? You're at the right place.")
            .setDescription("Here are the options you may use:")
            .addFields([{
                name: "📣 - Yell \"Buno out!\"",
                value: "Use it right before you play your second last card."
            }, {
                name: "🃏 - Challenge the previous player who hasn't yelled out \"Buno out!\"",
                value: "Use it whenever the previous player forgot to yell \"Buno out\""
            }, {
                name: "❗ - Contest the +4 forced drawing",
                value: "Use it when you think previous player could play something else than +4"
            }, {
                name: "⚠️ - Open the admin abuse panel",
                value: "Use it whenever you're the host and want to admin abuse"
            }, {
                name: "🔨 - Contest admin abuse",
                value: "Use it whenever you think the host admin abused."
            }]);
        const row = new ActionRowBuilder<ButtonBuilder>()
            .setComponents([
                new ButtonBuilder()
                    .setCustomId(ButtonIDs.SHOUT_UNO)
                    .setEmoji("📣")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!game.settings.shouldYellBUNO),
                new ButtonBuilder()
                    .setCustomId(ButtonIDs.CONTEST_SHOUT_UNO)
                    .setEmoji("🃏")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!game.settings.shouldYellBUNO),
                new ButtonBuilder()
                    .setCustomId(ButtonIDs.CONTEST_PLUS4)
                    .setEmoji("❗")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!game.settings.allowContest),
                new ButtonBuilder()
                    .setCustomId(ButtonIDs.ADMINABUSE_PANEL)
                    .setEmoji("⚠️")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!game.settings.adminabusemode),
                new ButtonBuilder()
                    .setCustomId(ButtonIDs.CONTEST_ADMIN_ABUSE)
                    .setEmoji("🔨")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!game.settings.adminabusemode)
            ]);
        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};
