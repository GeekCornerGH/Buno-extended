import { Client, StringSelectMenuInteraction } from "discord.js";
import { t } from "i18next";

import { runningUnoGame, unoCard } from "../../typings/unoGame.js";
import { colors } from "../constants.js";
import { getUsername } from "../getUsername.js";
import draw from "./draw.js";
import endTurn from "./endTurn.js";
import next from "./next.js";

export default async function draw4(game: runningUnoGame, toAppend: string, client: Client, interaction: StringSelectMenuInteraction | null, card: unoCard | null) {
    game.turnProgress = "chooseColor";
    const playerHolder = game.currentPlayer;
    const lng = game.locale;
    const color = (interaction ? interaction.values[0].split("-")[0] as string : card?.split("-")[0] as string) as typeof colors[number];
    if ((game.settings.allowStacking && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => (c.startsWith(color) && c.endsWith("-+2")) || c === "+4")) || (game.settings.reverseAnything && game.cards[next(game.players, game.players.findIndex(p => p === game.currentPlayer))].find(c => c.endsWith("-reverse")))) {
        game.drawStack += 4;
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
    }
    else {
        game.drawStack += 4;
        const nextPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer));
        toAppend += `\n${t("strings:game.draw.drewAndSkipped", { name: await getUsername(client, game.guildId, nextPlayer, !game.guildApp), lng, stack: game.drawStack })}`;
        game.cards[nextPlayer] = game.cards[nextPlayer].concat(await draw(game.cardsQuota, game.drawStack));
        if (game.cards[nextPlayer].length >= 2 && game.unoPlayers.includes(nextPlayer)) game.unoPlayers.splice(game.unoPlayers.findIndex(p => p === nextPlayer), 1);
        game.turnProgress = "chooseCard";
        game.drawStack = 0;
        game.currentPlayer = next(game.players, game.players.findIndex(p => p === game.currentPlayer), 2);
    }
    return endTurn(client, game, interaction, playerHolder, "played", toAppend);
}
