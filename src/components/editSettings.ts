import { ActionRowBuilder, EmbedBuilder, InteractionReplyOptions, InteractionUpdateOptions, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { t } from "i18next";

import { resources } from "../typings/i18next.js";
import { unoGame, unoSettings } from "../typings/unoGame.js";
import { SelectIDs } from "../utils/constants.js";



const comp = async (game: unoGame) => {
    const lng = game.locale;
    const blacklistedSettings = ["antiSabotage"];
    const noEverywhere = ["resendGameMessage"];
    const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(t("strings:settings.embed.title", { lng }))
        .setDescription(Object.keys(game.settings).filter(e => game.guildApp || !noEverywhere.includes(e)).map(e => {
            const key = e as keyof unoSettings;
            const value = game.settings[key];
            const i18nKey = "strings:settings.options." + e as keyof typeof resources.strings.settings.options;
            return game.state === "inProgress" && blacklistedSettings.includes(e) ? `${t(i18nKey as any, { lng })} : [REDACTED] :trol:` : `${t(i18nKey as any, { lng })} : *${value === true ? "✅" : value === false ? "❌" : value}*`;
        }).join("\n"))
        .setFooter({ text: t("strings:settings.embed.footer", { lng }) });
    const row = [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
        new StringSelectMenuBuilder().setCustomId(SelectIDs.EDIT_GAME_SETTINGS).setPlaceholder(t("strings:settings.placeholder", { lng })).setOptions([
            ...Object.keys(game.settings).filter(e => game.guildApp || !noEverywhere.includes(e)).map(e => {
                const key = e as keyof unoSettings;
                const value = game.settings[key];
                return new StringSelectMenuOptionBuilder().setLabel(t("strings:settings.options." + e as any, { lng })).setValue(e).setDescription(t("strings:settings.currentValue", { lng, value: value === true ? "✅" : value === false ? "❌" : typeof value === "number" ? value : t(`strings:settings.value.${value}`) }));
            })
        ]).setMaxValues(1).setMinValues(1)
    ])];
    return { components: row, embeds: [embed] } as InteractionReplyOptions | InteractionUpdateOptions;
};
export default comp;
