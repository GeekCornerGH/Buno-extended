import { InteractionUpdateOptions, MessageFlags, TextChannel } from "discord.js";
import { t } from "i18next";

import runningGameMessage from "../../components/runningGameMessage.js";
import { stringSelect } from "../../typings/stringSelect.js";
import { unoCard } from "../../typings/unoGame.js";
import { SelectIDs, uniqueVariants } from "../../utils/constants.js";
import playCard from "../../utils/game/playCard.js";
import { getUsername } from "../../utils/getUsername.js";

export const s: stringSelect = {
    name: SelectIDs.CHOOSE_CARD,
    execute: async (client, interaction) => {
        const card = interaction.values[0] as unoCard | typeof uniqueVariants[number] | "draw" | "skip";
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        await interaction.deferUpdate();
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state === "waiting") return interaction.reply({
            content: t("strings:errors.waiting", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: t("strings:game.notYourTurn", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.currentPlayer !== interaction.user.id) {
            return interaction.editReply({
                content: t("strings:game.notYourTurn", { lng }),
                components: []
            });
        }
        if (game.drawStack > 0) {
            const msg = t("strings:game.card.avoidDraw", { lng, name: await getUsername(client, game.guildId, interaction.user.id, !game.guildApp) });
            if (game.guildApp) await (interaction.channel as TextChannel).send(msg);
            else {
                game.previousActions.push(msg);
                await interaction.editReply({
                    message: game.messageId,
                    ...await runningGameMessage(client, game) as InteractionUpdateOptions
                });
            }
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        return playCard(game, card, interaction, lng);
    }
};
