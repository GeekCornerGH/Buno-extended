import { button } from "../../../typings/button";
import { config } from "../../utils/config";
import { ButtonIDs } from "../../utils/constants";
import startGame from "../../utils/game/startGame";

export const b: button = {
    name: ButtonIDs.START_GAME,
    execute: (client, interaction) => {
        const games = client.games.find(g => g.guildId === interaction.guildId && g.messageId === interaction.message.id);
        if (!games) return interaction.reply({ ephemeral: true, content: "No game was found in this channel" });
        if (games.hostId !== interaction.user.id && !config.developerIds.includes(interaction.user.id)) return interaction.reply({ content: "You're not the game host.", ephemeral: true });
        if (games.players.length < 2 && games._modified !== true) return interaction.reply({ ephemeral: true, content: "You can't start a game alone" });
        startGame(client, games, false, interaction.message);
        interaction.deferReply({ ephemeral: true });
        interaction.deleteReply();
    }
};
