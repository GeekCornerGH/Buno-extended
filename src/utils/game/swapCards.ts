import { Client, Snowflake, StringSelectMenuInteraction } from "discord.js";

import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { getUsername } from "../getUsername.js";
import endTurn from "./endTurn.js";
import next from "./next.js";

export async function swapCards(game: runningUnoGame, player: Snowflake, interaction: StringSelectMenuInteraction | null, client: Client) {
    const tempHolder = game.cards[game.currentPlayer];
    const tempPlayer = game.currentPlayer;
    game.cards[game.currentPlayer] = game.cards[player];
    game.cards[player] = tempHolder;
    game.currentCard = game.playedCard as unoCard;
    game.currentPlayer = next(game.players, game.players.findIndex(p => p === tempPlayer));
    game.turnProgress = "chooseCard";
    if (game.settings.shouldYellBUNO && game.unoPlayers.includes(tempPlayer)) {
        game.unoPlayers.push(player);
        game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === tempPlayer), 1);
    }
    if (game.settings.shouldYellBUNO && game.unoPlayers.includes(player)) {
        game.unoPlayers.push(tempPlayer);
        game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === player), 1);
    }
    endTurn(client, game, interaction, tempPlayer, "played", `**${await getUsername(client, game.guildId, tempPlayer, !game.guildApp)}** exchanged cards with **${await getUsername(client, game.guildId, player, !game.guildApp)}**`);
}
