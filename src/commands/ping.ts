import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

import { command } from "../typings/command.js";
import generateLocalized from "../utils/i18n/generateLocalized.js";

export const c: command = {
    data: new SlashCommandBuilder()
        .setName(t("strings:commands.ping.command.name", { lng: "en" }))
        .setDescription(t("strings:commands.ping.command.description", { lng: "en" }))
        .setNameLocalizations(generateLocalized("strings:commands.ping.command.name"))
        .setDescriptionLocalizations(generateLocalized("strings:commands.ping.command.description"))
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),
    execute: async (client, interaction) => {
        const lng = interaction.locale.split("-")[0];
        const msg = await interaction.reply({
            content: t("strings:commands.ping.message.pre-pong", { lng }),
            fetchReply: true
        });
        const actualPing = msg.createdTimestamp - interaction.createdTimestamp;
        return await interaction.editReply(t("strings:commands.ping.message.pong", { lng, WSPingEmote: pingToEmote(client.ws.ping), WSPing: client.ws.ping, pingEmote: pingToEmote(actualPing), ping: actualPing }));
    }
};

function pingToEmote(ping: number) {
    if (ping < 350) return ":green_circle:";
    else if (ping >= 350 && ping < 750) return ":orange_circle:";
    else return ":red_circle:";
}
