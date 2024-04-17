import { ActionRowBuilder, EmbedBuilder, InteractionReplyOptions, InteractionUpdateOptions, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

import { unoGame } from "../../typings/unoGame.js";
import { defaultSettings, SelectIDs, settingsMapToName } from "../utils/constants.js";



const comp = async (game: unoGame) => {
    const blacklistedSettings = ["antiSabotage"];
    const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle("Game settings")
        .setDescription(Object.keys(game.settings).map(e => {
            const value = game.settings[e];
            return game.state === "inProgress" && blacklistedSettings.includes(e) ? `${settingsMapToName[e]} : Find out :trol:` : `${settingsMapToName[e]} : *${value === true ? "✅" : value === false ? "❌" : value}*`;
        }).join("\n"))
        .setFooter({ text: "Settings are automatically saved per guild, and per member." });
    const row = [new ActionRowBuilder<StringSelectMenuBuilder>().setComponents([
        new StringSelectMenuBuilder().setCustomId(SelectIDs.EDIT_GAME_SETTINGS).setPlaceholder("Edit game settings and rules here").setOptions([
            ...Object.keys(defaultSettings).map(e => {
                const value = game.settings[e];
                return new StringSelectMenuOptionBuilder().setLabel(settingsMapToName[e]).setValue(e).setDescription(`Current value: ${value === true ? "✅" : value === false ? "❌" : value}`);
            })
        ]).setMaxValues(1).setMinValues(1)
    ])];
    return { components: row, embeds: [embed] } as InteractionReplyOptions | InteractionUpdateOptions;
};
export default comp;
