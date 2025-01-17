import { t } from "i18next";

import leaderboard from "../../components/leaderboard.js";
import { Buno } from "../../database/models/buno.js";
import { button } from "../../typings/button";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.LEADERBOARD_NEXT,
    execute: async (client, interaction) => {
        if (!interaction.inGuild()) return;
        const lng = interaction.locale.split("-")[0];
        if (interaction.message.interactionMetadata?.user.id !== interaction.user.id) return interaction.reply({
            content: t("strings:errors.paginationForbidden", { lng }),
            ephemeral: true
        });
        if ((interaction.message.editedTimestamp ?? interaction.message.createdTimestamp) < (Date.now() - (5 * 60 * 60 * 1000))) {
            return interaction.reply({
                content: t("strings:errors.paginationTooOld", { lng }),
                ephemeral: true
            });
        }
        const offset = parseInt(interaction.customId.split("_")[1]);
        await interaction.deferUpdate();
        const dbReq = await Buno.findAndCountAll({
            where: {
                guildId: interaction.guildId
            },
            order: [["wins", "DESC"]],
            limit: 25,
            offset: offset * 25
        });
        const { count } = dbReq;
        interaction.editReply(await leaderboard(dbReq.rows, interaction, count, offset));
    }
};
