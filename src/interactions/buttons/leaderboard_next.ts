import leaderboard from "../../components/leaderboard.js";
import { Buno } from "../../database/models/buno.js";
import { button } from "../../typings/button";
import { ButtonIDs } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.LEADERBOARD_NEXT,
    execute: async (client, interaction) => {
        if (interaction.message.interaction.user.id !== interaction.user.id) return interaction.reply({
            content: "You are not allowed to control this pagination.",
            ephemeral: true
        });
        if ((interaction.message.editedTimestamp ?? interaction.message.createdTimestamp) < (Date.now() - (5 * 60 * 60 * 1000))) return interaction.reply({
            content: "The pagination is too old.",
            ephemeral: true
        });
        const offset = parseInt(interaction.customId.split("_")[1]);
        await interaction.deferUpdate();
        const dbReq = await Buno.findAndCountAll({
            where: {
                guildId: interaction.guildId
            },
            order: [["wins", "DESC"]],
            limit: 14,
            offset: offset * 14
        });
        const count = await Buno.count();
        interaction.editReply(await leaderboard(dbReq.rows, interaction, count, offset));
    }
};
