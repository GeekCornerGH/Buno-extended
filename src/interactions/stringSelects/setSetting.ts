import { ActionRowBuilder, InteractionUpdateOptions, MessageFlags, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { t } from "i18next";

import editSettings from "../../components/editSettings.js";
import { Buno } from "../../database/models/buno.js";
import { stringSelect } from "../../typings/stringSelect.js";
import { unoSettings } from "../../typings/unoGame.js";
import { config } from "../../utils/config.js";
import { defaultSettings, maxAmountOfAIBots, ModalsIDs, SelectIDs, SettingsIDs } from "../../utils/constants.js";

export const s: stringSelect = {
    name: SelectIDs.EDIT_GAME_SETTINGS,
    execute: async (client, interaction) => {
        const option = interaction.values[0] as keyof unoSettings;
        const game = client.games.find(g => g.channelId === interaction.channelId && g.guildId === interaction.guildId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: "Only the host can change settings.",
            flags: MessageFlags.Ephemeral
        });
        if (game.state === "inProgress") return interaction.reply({
            content: "nuh uh ☝️",
            flags: MessageFlags.Ephemeral
        });
        const req = await Buno.findOne({
            where: {
                guildId: interaction.guildId ?? interaction.channelId,
                userId: interaction.user.id
            }
        });
        if (!req) await Buno.create({
            userId: interaction.user.id,
            guildId: interaction.guildId ?? interaction.channelId,
            wins: 0,
            losses: 0,
            settings: {
                ...defaultSettings
            }
        });
        const settings = { ...defaultSettings, ...req?.getDataValue("settings") };
        if (typeof game.settings[option] === "boolean") {
            game.settings[option] = !game.settings[option] as never;
            await Buno.update({
                settings: game.settings
            }, {
                where: {
                    userId: game.hostId,
                    guildId: interaction.guildId ?? interaction.channelId
                }
            });
            return interaction.update({ ...await editSettings(game) as InteractionUpdateOptions });
        }
        else if (typeof game.settings[option] === "number") {
            if (option === "timeoutDuration") {
                return await interaction.showModal(new ModalBuilder()
                    .setTitle(t("strings:settings.timeoutDuration.modal.title", { lng }))
                    .setCustomId(SettingsIDs.TIMEOUT_DURATION_MODAL)
                    .setComponents([new ActionRowBuilder<ModalActionRowComponentBuilder>()
                        .setComponents([
                            new TextInputBuilder()
                                .setLabel(t("strings:settings.timeoutDuration.modal.fieldLabel", { lng }))
                                .setMinLength(2)
                                .setMaxLength(4)
                                .setStyle(TextInputStyle.Short)
                                .setValue(game.settings.timeoutDuration.toString() ?? defaultSettings.timeoutDuration.toString())
                                .setCustomId(SettingsIDs.TIMEOUT_DURATION_MODAL_SETTING)
                        ])]));
            }
            else if (option === "amountOfAiBots") {
                return await interaction.showModal(new ModalBuilder()
                    .setTitle(t("strings:settings.ai.modal.title", { lng }))
                    .setCustomId(ModalsIDs.AI_BOTS)
                    .setComponents([new ActionRowBuilder<ModalActionRowComponentBuilder>()
                        .setComponents([
                            new TextInputBuilder()
                                .setLabel(t("strings:settings.ai.modal.label", { lng, amount: maxAmountOfAIBots }))
                                .setMinLength(1)
                                .setMaxLength(1)
                                .setStyle(TextInputStyle.Short)
                                .setValue(game.settings.amountOfAiBots.toString() ?? defaultSettings.amountOfAiBots.toString())
                                .setCustomId(ModalsIDs.AI_BOTS_FIELD)
                        ])]));
            }
        }
        else if (typeof game.settings[option] === "string") {
            const optionsStrings = {
                canJoinMidgame: ["temporarily", "no", "always"]
            } as {
                [id: string]: string[]
            };
            const next = optionsStrings[option].findIndex(o => o === game.settings[option]) + 1;
            game.settings[option] = optionsStrings[option][next > optionsStrings[option].length - 1 ? 0 : next] as never;
            await Buno.update({
                settings
            }, {
                where: {
                    userId: game.hostId,
                    guildId: interaction.guildId ?? interaction.channelId
                }
            });
            return interaction.update({ ...await editSettings(game) as InteractionUpdateOptions });
        }
        return;
    }
};
