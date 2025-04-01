import { InteractionUpdateOptions, TextChannel } from "discord.js";
import { t } from "i18next";

import runningGameMessage from "../../components/runningGameMessage.js";
import { stringSelect } from "../../typings/stringSelect.js";
import { colors, SelectIDs, variants } from "../../utils/constants.js";
import draw4 from "../../utils/game/draw4.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import { getUsername } from "../../utils/getUsername.js";

export const s: stringSelect = {
    name: SelectIDs.CHOOSE_COLOR,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        const color = interaction.values[0].split("-")[0] as typeof colors[number];
        await interaction.deferUpdate();
        if (!game) return interaction.editReply({
            content: t("strings:errors.gameNotFound", { lng: interaction.locale.split("-")[0] }),
            components: [],
        });
        if (game.state === "waiting") return interaction.editReply({
            content: t("strings:errors.waiting", { lng }),
            components: []
        });
        if (game.currentPlayer !== interaction.user.id) {
            return interaction.editReply({
                content: t("strings:game.notYourTurn", { lng }),
                components: []
            });
        }
        if (game.turnProgress !== "chooseColor") {
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        if (!colors.includes(color)) {
            const msg = t("strings:game.card.unknownColor", { lng, name: await getUsername(client, game.guildId, interaction.user.id, !game.guildApp) });
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
        game.currentCard = `${color}-${game.playedCard}` as `${typeof colors[number]}-${typeof variants[number]}`;
        game.turnProgress = "chooseCard";
        const toAppend: string = t("strings:game.color.switched", { lng, color: t(`strings:colors.${color}` as any, { lng }) });
        if (game.playedCard === "+4") {
            return draw4(game, toAppend, client, interaction, null);
        }
        else {
            game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            game.playedCard = undefined;

            endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
        }
    }
};
