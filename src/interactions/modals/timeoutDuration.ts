import { modal } from "../../../typings/modal.js";
import editSettings from "../../components/editSettings.js";
import { Buno } from "../../database/models/buno.js";
import { config } from "../../utils/config.js";
import { defaultSettings, SettingsIDs } from "../../utils/constants.js";

export const m: modal = {
    name: SettingsIDs.TIMEOUT_DURATION_MODAL,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId && g.guildId === interaction.guildId);
        if (!game) return interaction.reply({
            content: "No game is currently running.",
            ephemeral: true,
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: "Only the host can change settings.",
            ephemeral: true
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
            await interaction.editReply({ content: "The value must be a valid integer" });
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
