import { ActionRowBuilder, Client, InteractionReplyOptions, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { t } from "i18next";

import { runningUnoGame } from "../typings/unoGame.js";
import { SelectIDs } from "../utils/constants.js";
import { getUsername } from "../utils/getUsername.js";

export default async (client: Client, game: runningUnoGame, player: string): Promise<InteractionReplyOptions> => {
    const lng = game.locale;
    const createRow = async () => {
        const optionsPromises = game.players.map(async p => {
            if (player === p) return;
            const displayName = await getUsername(client, game.guildId, p, !game.guildApp);
            return new StringSelectMenuOptionBuilder()
                .setValue(p)
                .setLabel(displayName);
        });

        const options = (await Promise.all(optionsPromises)).filter(p => p !== undefined);
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([new StringSelectMenuBuilder()
            .setCustomId(SelectIDs.PLAYER_USER_SELECT)
            .setPlaceholder(t("strings:game.playerPicker", { lng }))
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(options)
        ]);
        return row;
    };
    return {
        components: [await createRow()],
        content: t("strings:game.card.seven", { lng }),
        flags: MessageFlags.Ephemeral
    };
};
