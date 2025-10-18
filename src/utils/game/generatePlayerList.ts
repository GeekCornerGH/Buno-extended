import { Client, Snowflake } from "discord.js";
import { t } from "i18next";

import { unoGame } from "../../typings/unoGame.js";
import { getUsername } from "../getUsername.js";

export default async function generatePlayerList(client: Client, game: unoGame): Promise<string> {
    let string = "```diff\n";
    const usernames: { [key: Snowflake]: string } = {};
    for (const player of game.players) {
        usernames[player] = player.startsWith("AI-") ? player.split("-")[1] + " 🤖" : await getUsername(client, game.guildId, player, !game.guildApp);
    }
    // Generate the string
    for (const e of game.players) {
        const username = usernames[e];
        if (game.state === "inProgress") string += t("strings:game.message.embed.playerList", {
            count: game.cards[e].length,
            cards: ` - ${game.cards[e].length.toString().padStart(Math.max(...Object.values(game.cards).map(v => v.length.toString().length)), "")}`,
            name: username?.padEnd(Math.max(...Object.values(usernames).map(el => el.length)), " "),
            plus: game.currentPlayer === e ? "+ " : "  ",
            lng: game.locale
        });
        else string += username + "\n";
    }
    string += "```";
    return string;
}
