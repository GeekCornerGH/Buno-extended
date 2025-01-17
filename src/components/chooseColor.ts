import { ActionRowBuilder, InteractionReplyOptions, InteractionUpdateOptions, MessageFlags, StringSelectMenuBuilder } from "discord.js";
import { t } from "i18next";

import { colorEmotes, colors, SelectIDs, uniqueVariants } from "../utils/constants.js";

export default (cardType: typeof uniqueVariants[number], lng: string): InteractionReplyOptions | InteractionUpdateOptions => {
    return {
        content: t("strings:game.color.text", { lng }),
        flags: MessageFlags.Ephemeral,
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
                new StringSelectMenuBuilder().setCustomId(SelectIDs.CHOOSE_COLOR)
                    .setPlaceholder(t("strings:game.color.pick", { lng }))
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setOptions([
                        ...Object.values(colors).map(c => {
                            return {
                                label: t(`strings:colors.${c}` as any, { lng }),
                                value: `${c}-${cardType}`,
                                emoji: colorEmotes[c]
                            };
                        })
                    ])
            ])
        ]
    };
};
