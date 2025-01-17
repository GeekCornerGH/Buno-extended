import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.ACTIONS_MENU,
    execute: (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
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
        else if (!game.settings.adminabusemode && !game.settings.shouldYellBUNO && !game.settings.allowContest) return interaction.reply({
            content: t("strings:errors.noActions", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(t("strings:game.actions.menu.title", { lng }))
            .setDescription(t("strings:game.actions.menu.description", { lng }))
            .addFields([{
                name: t("strings:game.actions.menu.options.yell.name", { lng }),
                value: t("strings:game.actions.menu.options.yell.value", { lng })
            }, {
                name: t("strings:game.actions.menu.options.challenge.name", { lng }),
                value: t("strings:game.actions.menu.options.challenge.value", { lng })
            }, {
                name: t("strings:game.actions.menu.options.contestDraw.name", { lng }),
                value: t("strings:game.actions.menu.options.contestDraw.value", { lng })
            }, {
                name: t("strings:game.actions.menu.options.aa.name", { lng }),
                value: t("strings:game.actions.menu.options.aa.value", { lng })
            }, {
                name: t("strings:game.actions.menu.options.contestAa.name", { lng }),
                value: t("strings:game.actions.menu.options.contestAa.value", { lng })
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
            flags: MessageFlags.Ephemeral
        });
    }
};
