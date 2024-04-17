import { button } from "../../../typings/button.js";
import { ButtonIDs } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";

export const b: button = {
    name: ButtonIDs.CONTEST_PLUS4,
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
        if (!game.currentCard.endsWith("-+4")) return interaction.reply({
            content: "You can't use this button right now.",
            ephemeral: true
        });
        const [pColor] = game.log[game.log.length - 2].card.split("-");
        let toAppend: string = "";
        const prevPlayer = game.log[game.log.length - 1].player;
        if (interaction.user.id === prevPlayer) return interaction.reply({
            content: "You can't contest your own +4",
            ephemeral: true
        });
        await interaction.deferUpdate();
        if (game.cards[prevPlayer].findIndex(c => c.startsWith(pColor)) !== -1) {
            game.cards[prevPlayer] = game.cards[prevPlayer].concat(draw(game.cardsQuota, game.drawStack));
            if (game.cards[prevPlayer].length >= 2 && game.unoPlayers.includes(prevPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === prevPlayer), 1);
            toAppend += `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** contested **${interaction.guild.members.cache.get(prevPlayer).displayName}**'s +4 card and won.\n**${interaction.guild.members.cache.get(prevPlayer).displayName}** drew ${game.drawStack} cards`;
            game.drawStack = 0;
            endTurn(client, game, interaction, interaction.user.id, "misc", toAppend, false);
        }
        else {
            toAppend += `**${interaction.guild.members.cache.get(interaction.user.id).displayName}** contested **${interaction.guild.members.cache.get(prevPlayer).displayName}**'s +4 card and failed.\n**${interaction.guild.members.cache.get(prevPlayer).displayName}** drew ${game.drawStack + 2} cards`;
            if (game.cards[prevPlayer].length >= 2 && game.unoPlayers.includes(prevPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === prevPlayer), 1);
            game.cards[prevPlayer] = game.cards[prevPlayer].concat(draw(game.cardsQuota, game.drawStack + 2));
            game.drawStack = 0;
            endTurn(client, game, interaction, interaction.user.id, "misc", toAppend, false);
        }
    }
};
