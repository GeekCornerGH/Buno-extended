import { ActionRowBuilder, EmbedBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { t } from "i18next";

import backToAdminAbuseHome from "../../components/backToAdminAbuseHome.js";
import { button } from "../../typings/button.js";
import { ButtonIDs, SelectIDs } from "../../utils/constants.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.ADMIN_ABUSE_EDIT_CARDS,
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
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
        const embed = new EmbedBuilder()
            .setTitle(t("strings:game.aa.edit.embed.title", { lng }))
            .setDescription(t("strings:game.aa.edit.embed.description", { lng }));
        const options = await Promise.all(game.players.map(async p => new StringSelectMenuOptionBuilder()
            .setLabel(await getUsername(client, game.guildId, p, !game.guildApp))
            .setValue(p)
        ));
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([new StringSelectMenuBuilder()
            .setCustomId(SelectIDs.ADMIN_ABUSE_PLAYER_CARDS_EDIT)
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(t("strings:game.playerPicker", { lng }))
            .setOptions(options)
        ]);
        await interaction.editReply({ embeds: [embed], components: [row, backToAdminAbuseHome(game.locale)] });
    }
};
