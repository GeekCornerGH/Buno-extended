import { EmbedBuilder } from "discord.js";
import { t } from "i18next";

import backToAdminAbuseHome from "../../components/backToAdminAbuseHome.js";
import { button } from "../../typings/button.js";
import { unoCard } from "../../typings/unoGame.js";
import { config } from "../../utils/config.js";
import { ButtonIDs, cardEmojis, cardEmotes } from "../../utils/constants.js";
import toTitleCase from "../../utils/game/toTitleCase.js";
import { getUsername } from "../../utils/getUsername.js";

export const b: button = {
    name: ButtonIDs.ADMIN_ABUSE_VIEW_CARDS,
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            ephemeral: true
        });
        else if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.notRunning", { lng }),
            ephemeral: true
        });
        else if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            ephemeral: true
        });
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        game.adminAbused = true;
        await interaction.deferUpdate();
        const fields = await Promise.all(game.players.map(async p => {
            return {
                name: await getUsername(client, game.guildId, p),
                value: (() => {
                    const cards = game.cards[p] as unoCard[];

                    const mapped = cards.map(card => {
                        return config.emoteless
                            ? `${cardEmotes[card]} ${toTitleCase(card, lng)}`
                            : `${cardEmojis[card]}`;
                    });

                    return mapped.join(config.emoteless ? ", " : " ");
                })()
            };
        }));

        const embed = new EmbedBuilder()
            .setTitle(t("strings:game.aa.view.title", { lng }))
            .setFields(fields);
        return interaction.editReply({
            embeds: [embed],
            components: [backToAdminAbuseHome(game.locale)]
        });
    }
};
