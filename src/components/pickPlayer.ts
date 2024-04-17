import { ActionRowBuilder, InteractionReplyOptions, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import { customClient } from "../../typings/client.js";
import { runningUnoGame } from "../../typings/unoGame.js";
import { SelectIDs } from "../utils/constants.js";

export default (client: customClient, game: runningUnoGame, player: string): InteractionReplyOptions => {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([new StringSelectMenuBuilder()
        .setCustomId(SelectIDs.PLAYER_USER_SELECT)
        .setPlaceholder("Choose a player to swap your cards with")
        .setMinValues(1)
        .setMaxValues(1)
        .setOptions(...game.players.map(p => {
            if (player === p) return;
            return new StringSelectMenuOptionBuilder()
                .setValue(p)
                .setLabel(`${client.guilds.cache.get(game.guildId).members.cache.get(p).displayName}`);
        }).filter(p => p !== undefined))
    ]);
    return {
        components: [row],
        content: "You played a 7 card and shall now select a player to exchange your cards with.",
        ephemeral: true
    };
};
