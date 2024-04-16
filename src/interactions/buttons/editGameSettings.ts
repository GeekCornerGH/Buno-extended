
import { InteractionReplyOptions } from "discord.js";

import { button } from "../../../typings/button";
import editSettings from "../../components/editSettings";
import { Buno } from "../../database/models/buno";
import { config } from "../../utils/config";
import { ButtonIDs, defaultSettings } from "../../utils/constants";

export const b: button = {
    name: ButtonIDs.EDIT_GAME_SETTINGS,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        if (!game) return interaction.reply({
            content: "No game is currently running.",
            ephemeral: true,
        });
        if (game.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({
            content: "Only the host can change settings.",
            ephemeral: true
        });
        const req = await Buno.findOne({
            where: {
                guildId: interaction.guild.id,
                userId: game.hostId
            }
        });
        game.settings = { ...defaultSettings, ...req.getDataValue("settings") };
        interaction.reply({ ephemeral: true, ...await editSettings(game) as InteractionReplyOptions });
    }
};
