import { EmbedBuilder, InteractionUpdateOptions, MessageFlags } from "discord.js";
import { t } from "i18next";

import lobbyGameMessage from "../../components/lobbyGameMessage.js";
import { button } from "../../typings/button";
import { ButtonIDs, maxPlayerInGame } from "../../utils/constants.js";

export const b: button = {
    name: ButtonIDs.JOIN_GAME,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.messageId === interaction.message.id);
        let lng = interaction.locale.split("-")[0];
        if (game) lng = game.locale;
        if (!game) return interaction.reply({
            content: t("strings:errors.gameNotFound", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.state === "inProgress") return interaction.reply({
            content: t("strings:errors.inProgress", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.players.includes(interaction.user.id)) return interaction.reply({
            content: t("strings:errors.inTheGame", { lng }),
            flags: MessageFlags.Ephemeral
        });
        if (game.players.length >= maxPlayerInGame) return interaction.reply({
            content: t("strings:errors.tooManyInGame", { lng, count: maxPlayerInGame }),
            flags: MessageFlags.Ephemeral
        });
        game.players.push(interaction.user.id);
        await interaction.update(await lobbyGameMessage(client, game) as InteractionUpdateOptions);
        const now = new Date();
        // Run on april fools, january is 0, april is 3
        if (now.getMonth() === 3 && now.getDate() === 1) return interaction.followUp({
            embeds: [new EmbedBuilder()
                .setImage("https://media1.tenor.com/m/x8v1oNUOmg4AAAAd/rickroll-roll.gif")
                .setTitle(t("strings:aprilFools", { lng }))
                .setTimestamp()
                .setColor("Red")],
            flags: MessageFlags.Ephemeral
        });
    }
};
