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
        if (game.state === "inProgress") string += t("strings:game.message.embed.playerList", {
            count: game.cards[e].length,
            cards: ` - ${game.cards[e].length.toString().padStart(Math.max(...Object.values(game.cards).map(v => v.length.toString().length)), "")}`,
            name: username?.padEnd(Math.max(...Object.values(usernames).map(el => el.length)), ""),
            plus: game.currentPlayer === e ? "+ " : "",
            lng: game.locale
        });
        else string += username + "\n";
    });
    string += "```";
    return string;
}
