import { APIGuildMember, ApplicationIntegrationType, BaseInteraction, ButtonInteraction, ChatInputCommandInteraction, GuildMember, MessageFlags, ModalSubmitInteraction, RepliableInteraction, StringSelectMenuInteraction } from "discord.js";
import { t } from "i18next";

import { Blacklisted } from "../database/models/blacklisted.js";
import { event } from "../typings/event.js";
import { config } from "../utils/config.js";
import { nameCache } from "../utils/getUsername.js";

export const e: event = async (client, interaction: BaseInteraction) => {
    const lng = interaction.locale.split("-")[0];
    const blCheck = await Blacklisted.findOne({
        where: {
            userId: interaction.user.id
        }
    });
    if (blCheck && !config.developerIds.includes(interaction.user.id)) return (interaction as RepliableInteraction).reply({
        content: t("strings:errors.blacklisted", { lng, reason: blCheck.getDataValue("reason") }),
        flags: MessageFlags.Ephemeral
    });
    nameCache.set(`${interaction.guildId ?? undefined}_${interaction.user.id}`, {
        name: interaction.inGuild() && ApplicationIntegrationType.GuildInstall in interaction.authorizingIntegrationOwners ?
            (interaction.member as GuildMember).displayName
            : interaction.inGuild() ?
                (interaction.member as APIGuildMember).nick ?? interaction.user.displayName
                : interaction.user.displayName,
        timestamp: Date.now()
    });
    if (interaction.isChatInputCommand()) {
        const i = interaction as ChatInputCommandInteraction;
        try {
            const command = client.commands.get(i.commandName);
            if (!command) return interaction.reply(t("strings:errors.interactionNotHandled", { lng }));
            command.execute(client, i);
        }
        catch (e) {
            if (i.isRepliable()) i.reply(t("strings:errors.interactionError", { lng }));
            else (i as ChatInputCommandInteraction).editReply(t("strings:errors.interactionError", { lng }));
            console.error(e);
        }
    }
    else if (interaction.isButton()) {
        const i = interaction as ButtonInteraction;
        const id = i.customId.split("_")[0];
        try {
            const button = client.buttons.get(id);
            if (!button) return interaction.reply(t("strings:errors.interactionNotHandled", { lng }));
            button.execute(client, i);
        }
        catch (e) {
            if (!i.isRepliable())
                (i as ButtonInteraction).editReply(t("strings:errors.interactionError", { lng }));
            else i.reply(t("strings:errors.interactionError", { lng }));
            console.error(e);
        }
    }
    else if (interaction.isStringSelectMenu()) {
        const i = interaction as StringSelectMenuInteraction;
        try {
            const stringselect = client.stringSelects.get(i.customId.split("_")[0]);
            if (!stringselect) return interaction.reply(t("strings:errors.interactionNotHandled", { lng }));
            stringselect.execute(client, i);
        }
        catch (e) {
            if (!i.isRepliable()) (i as StringSelectMenuInteraction).editReply(t("strings:errors.interactionError", { lng }));
            else i.reply(t("strings:errors.interactionError", { lng }));
            console.error(e);
        }
    }
    else if (interaction.isModalSubmit()) {
        const i = interaction as ModalSubmitInteraction;
        const id = i.customId.split("_")[0];
        try {
            const modal = client.modals.get(id);
            if (!modal) return interaction.reply(t("strings:errors.interactionNotHandled", { lng }));
            modal.execute(client, i);
        }
        catch (e) {
            if (!i.isRepliable()) (i as ModalSubmitInteraction).editReply(t("strings:errors.interactionError", { lng }));
            else i.reply(t("strings:errors.interactionError", { lng }));
            console.error(e);
        }
    }
    return;
};
