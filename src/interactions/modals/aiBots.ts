import { InteractionUpdateOptions, MessageFlags } from "discord.js";
import { t } from "i18next";

import editSettings from "../../components/editSettings.js";
import { Buno } from "../../database/models/buno.js";
import { modal } from "../../typings/modal.js";
import { config } from "../../utils/config.js";
import { defaultSettings, maxAmountOfAIBots, ModalsIDs } from "../../utils/constants.js";

export const m: modal = {
    name: ModalsIDs.AI_BOTS,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId && g.guildId === interaction.guildId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (!game.guildApp) return;
        if (game.state !== "waiting") return interaction.reply({
            content: t("strings:errors.gameJustStarted", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.notTheHost", { lng }),
            flags: MessageFlags.Ephemeral
        });
        const req = await Buno.findOne({
            where: {
                guildId: interaction.guildId ?? interaction.channelId as string,
                userId: game.hostId
            }
        });
        if (!req) await Buno.create({
            userId: game.hostId,
            guildId: interaction.guildId ?? interaction.channelId as string,
            wins: 0,
            losses: 0,
            settings: {
                ...defaultSettings
            }
        });
        const option = interaction.fields.getTextInputValue(ModalsIDs.AI_BOTS_FIELD);
        const int = intOrNaN(option);
        if (Number.isNaN(int) || int < 0 || int > maxAmountOfAIBots) {
            await interaction.deferUpdate();
            await interaction.editReply({ content: t("strings:errors.notAnInteger", { lng }) });
        }
        else {
            await interaction.deferUpdate();
            game.settings.amountOfAiBots = int;
            await Buno.update({
                settings: { ...game.settings },
            }, {
                where: {
                    guildId: interaction.guildId as string,
                    userId: game.hostId
                }
            });
            return await interaction.editReply({ ...await editSettings(game) as InteractionUpdateOptions });
        }
    }
};

function intOrNaN(x: string) {
    return /^\d+$/.test(x) ? +x : NaN;
}
