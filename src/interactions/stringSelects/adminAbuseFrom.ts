import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { t } from "i18next";

import { stringSelect } from "../../typings/stringSelect.js";
import { SelectIDs } from "../../utils/constants.js";
import { getUsername } from "../../utils/getUsername.js";

export const s: stringSelect = {
    name: SelectIDs.ADMIN_ABUSE_SWAP_CARDS_FROM,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            ephemeral: true
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            ephemeral: true
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            ephemeral: true
        });
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        const target = interaction.values[0];
        await interaction.deferUpdate();
        const options = await Promise.all(game.players.filter(p => p !== target).map(async p => new StringSelectMenuOptionBuilder().setLabel(await getUsername(client, game.guildId, interaction.user.id)).setValue(p)));
        return interaction.editReply({
            content: t("strings:game.aa.swap.from.select", { lng }),
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                    .setComponents([
                        new StringSelectMenuBuilder()
                            .setCustomId(SelectIDs.ADMIN_ABUSE_SWAP_CARDS_TO + "_" + target)
                            .setMaxValues(1)
                            .setMinValues(0)
                            .setPlaceholder(t("strings:game.playerPicker", { lng }))
                            .setOptions(options)
                    ])
            ]
        });
    }
};
