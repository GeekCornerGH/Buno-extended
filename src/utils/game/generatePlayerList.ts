import { Client, Snowflake } from "discord.js";
import { t } from "i18next";

import { unoGame } from "../../typings/unoGame.js";
import { getUsername } from "../getUsername.js";

export default async function generatePlayerList(client: Client, game: unoGame): Promise<string> {
    let string = "```diff\n";
    const usernames: { [key: Snowflake]: string } = {};
    for (const player of game.players) {
        const username = await getUsername(client, game.guildId, player);
        usernames[player] = username;
    }
    // Generate the string
    game.players.forEach(async e => {
        const username = usernames[e];
        string += t("game.message.embed.playerList", {
            count: game.state === "waiting" ? 0 : game.cards[e].length, cards: game.state === "inProgress" ? ` - ${game.cards[e].length.toString().padStart(Math.max(...Object.values(game.cards).map(v => v.length.toString().length)), "")}` : "", name: username?.padEnd(Math.max(...Object.values(usernames).map(el => el.length)), ""), plus: game.state === "inProgress" && game.currentPlayer === e ? "+ " : ""
        });
    });
    string += "```";
    return string;
}
