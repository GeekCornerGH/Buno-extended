import { ActionRowBuilder, InteractionReplyOptions, InteractionUpdateOptions, StringSelectMenuBuilder } from "discord.js";
import { t } from "i18next";

import { colorEmotes, colors, SelectIDs, uniqueVariants } from "../utils/constants.js";
import toTitleCase from "../utils/game/toTitleCase.js";

export default (cardType: typeof uniqueVariants[number], lng: string): InteractionReplyOptions | InteractionUpdateOptions => {
    return {
        content: t("strings:game.color.text", { lng }),
        ephemeral: true,
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
                new StringSelectMenuBuilder().setCustomId(SelectIDs.CHOOSE_COLOR)
                    .setPlaceholder(t("strings:game.color.pick", { lng }))
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setOptions([
                        ...Object.values(colors).map(c => {
                            return {
                                label: toTitleCase(c, lng),
                                value: `${c}-${cardType}`,
                                emoji: colorEmotes[c]
                            };
                        })
                    ])
            ])
        ]
    };
};
