import { MessageFlags } from "discord.js";
import { t } from "i18next";

import editSettings from "../../components/editSettings.js";
import { Buno } from "../../database/models/buno.js";
import { modal } from "../../typings/modal.js";
import { config } from "../../utils/config.js";
import { defaultSettings, SettingsIDs } from "../../utils/constants.js";

export const m: modal = {
    name: SettingsIDs.TIMEOUT_DURATION_MODAL,
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const game = client.games.find(g => g.channelId === interaction.channelId && g.guildId === interaction.guildId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notTheHost", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const req = await Buno.findOne({
            where: {
                guildId: interaction.guildId,
                userId: game.hostId
            }
        });
        if (!req) await Buno.create({
            userId: game.hostId,
            guildId: interaction.guildId,
            wins: 0,
            losses: 0,
            settings: {
                ...defaultSettings
            }
        });
        const option = interaction.fields.getTextInputValue(SettingsIDs.TIMEOUT_DURATION_MODAL_SETTING);
        const int = intOrNaN(option);
        if (!int) {
            await interaction.deferUpdate();
            await interaction.editReply({ content: t("strings:errors.notAnInteger", { lng }) });
        }
        else {
            await interaction.deferUpdate();
            game.settings.timeoutDuration = int;
            await Buno.update({
                settings: { ...game.settings },
            }, {
                where: {
                    guildId: interaction.guildId,
                    userId: game.hostId
                }
            });
            return await interaction.editReply({ ...await editSettings(game) });
        }
    }
};

function intOrNaN(x: string) {
    return /^\d+$/.test(x) ? +x : NaN;
}
