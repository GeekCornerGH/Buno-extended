import { GuildMember, GuildMemberManager } from "discord.js";

import { unoGame } from "../../typings/unoGame.js";

export default async function generatePlayerList(game: unoGame, members: GuildMemberManager): Promise<string> {
    let string = "```diff\n";
    const fetchedUsernames: string[] = [];

    for (const playerId of game.players) {
        const member: GuildMember = members.cache.get(playerId) || await members.fetch(playerId);
        const username = member.displayName;
        fetchedUsernames.push(username);
    }

    // Generate the string
    game.players.forEach(e => {
        const username = fetchedUsernames.find(name => members.cache.get(e).displayName === name);
        string += `${game.state === "inProgress" && game.currentPlayer === e ? "+ " : "  "} ${username.padEnd(Math.max(...fetchedUsernames.map(el => el.length)), " ")}${game.state === "inProgress" ? ` - ${game.cards[e].length.toString().padStart(Math.max(...Object.values(game.cards).map(v => v.length.toString().length)), " ")} card${game.cards[e].length > 1 ? "s" : ""}` : ""}\n`;
    });
    string += "```";
    return string;
}
