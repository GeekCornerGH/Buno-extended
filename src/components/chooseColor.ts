import { ActionRowBuilder, InteractionReplyOptions, InteractionUpdateOptions, StringSelectMenuBuilder } from "discord.js";

import { colorEmotes, colors, SelectIDs, uniqueVariants } from "../utils/constants.js";
import toTitleCase from "../utils/game/toTitleCase.js";

export default (cardType: typeof uniqueVariants[number]): InteractionReplyOptions | InteractionUpdateOptions => {
    return {
        content: "Please select a color",
        ephemeral: true,
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
                new StringSelectMenuBuilder().setCustomId(SelectIDs.CHOOSE_COLOR)
                    .setPlaceholder("Pick a color here!")
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setOptions([
                        ...Object.values(colors).map(c => {
                            return {
                                label: toTitleCase(c),
                                value: `${c}-${cardType}`,
                                emoji: colorEmotes[c]
                            };
                        })
                    ])
            ])
        ]
    };
};
