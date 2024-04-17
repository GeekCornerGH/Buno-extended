import { GuildMember } from "discord.js";

import { stringSelect } from "../../../typings/stringSelect.js";
import { runningUnoGame } from "../../../typings/unoGame.js";
import { colors, SelectIDs, variants } from "../../utils/constants.js";
import draw from "../../utils/game/draw.js";
import endTurn from "../../utils/game/endTurn.js";
import next from "../../utils/game/next.js";
import toTitleCase from "../../utils/game/toTitleCase.js";

export const s: stringSelect = {
    name: SelectIDs.CHOOSE_COLOR,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId) as runningUnoGame;
        const color = interaction.values[0].split("-")[0] as typeof colors[number];
        await interaction.deferUpdate();
        if (!game) return interaction.followUp({
            content: "The game you're talking about was not found",
            ephemeral: true
        });
        if (game.currentPlayer !== interaction.user.id) return interaction.editReply({
            content: "It's not your turn",
            components: []
        });
        if (game.turnProgress !== "chooseColor") {
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        if (!colors.includes(color)) {
            interaction.channel.send(`**${(interaction.member as GuildMember).displayName}** tried to play a non-existant color :clown:`);
            return interaction.editReply({
                content: "nuh uh ☝️",
                components: []
            });
        }
        game.currentCard = `${color}-${game.playedCard}` as `${typeof colors[number]}-${typeof variants[number]}`;
        game.turnProgress = "chooseCard";
        let toAppend: string = `The color switched to ${toTitleCase(color)}`;
        if (game.playedCard === "+4") {
            game.turnProgress = "chooseColor";
            if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => (c.startsWith(color) && c.endsWith("-+2")) || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-reverse")))) {
                game.drawStack += 4;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
            }
            else {
                game.drawStack += 4;
                const nextPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
                toAppend += `\n** ${(client.guilds.cache.get(game.guildId).members.cache.get(nextPlayer) as GuildMember).displayName}** drew ${game.drawStack} cards and has been skipped.`;
                game.cards[nextPlayer] = game.cards[nextPlayer].concat(draw(game.cardsQuota, game.drawStack));
                if (game.cards[game.currentPlayer].length >= 2 && game.unoPlayers.includes(game.currentPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === game.currentPlayer), 1);
                game.turnProgress = "chooseCard";
                game.drawStack = 0;
                game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id), 2);
            }
        }
        else game.currentPlayer = next(game.players, game.players.findIndex(p => p === interaction.user.id));
        game.playedCard = undefined;

        endTurn(client, game, interaction, interaction.user.id, "played", toAppend);
    }
};
