import { button } from "../../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";

export const b: button = {
    name: ButtonIDs.CONTEST_SHOUT_UNO,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!game) return interaction.reply({
            content: "Cannot find the game you're talking about",
            ephemeral: true
        });
        if (game.state === "waiting") return interaction.reply({
            content: "The game isn't running yet.",
            ephemeral: true
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: "This is not your turn.",
            ephemeral: true
        });
        const previousPlayer = game.log[game.log.length - 1].player;
        if (!previousPlayer) return interaction.reply({
            content: "The game just started, you can't do this now.",
            ephemeral: true
        });
        if (game.cards[previousPlayer].length !== 1) return interaction.reply({
            content: "The previous player has too many cards to be able to yell \"Buno out!\"",
            ephemeral: true
        });
        if (game.unoPlayers.includes(previousPlayer)) return interaction.reply({
            content: "The player already yelled \"Buno out!\"",
            ephemeral: true
        });
        await interaction.deferUpdate();
        const toAppend = `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** pointed out that **${interaction.guild.members.cache.get(previousPlayer).displayName}** forgot to yell "Buno out!"\n**${interaction.guild.members.cache.get(previousPlayer).displayName}** drew 2 cards.`;
        game.cards[previousPlayer] = game.cards[previousPlayer].concat(draw(game.cardsQuota, 2));
        endTurn(client, game, interaction, interaction.user.id, "misc", toAppend, false);
    }
};
