import { ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { t } from "i18next";

import { button } from "../../typings/button.js";
import { ButtonIDs, SelectIDs } from "../../utils/constants.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.ADMIN_ABUSE_SWAP_CARDS,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        else if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.notRunning", { lng }),
            flags: MessageFlags.Ephemeral
        });
        else if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            flags: MessageFlags.Ephemeral
        });
        await interaction.deferUpdate();
        const options = await Promise.all(game.players.map(async p => {
            return new StringSelectMenuOptionBuilder().setLabel(await getUsername(client, game.guildId, p, !game.guildApp)).setValue(p);
        }));
        return await interaction.editReply({
            content: t("strings:game.aa.swap.text", { lng }),
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(SelectIDs.ADMIN_ABUSE_SWAP_CARDS_FROM)
                    .setPlaceholder(t("strings:game.playerPicker", { lng }))
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(options)
            ])]
        });
    }
};
