import { BaseInteraction, ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, RepliableInteraction, StringSelectMenuInteraction } from "discord.js";

import { event } from "../../typings/event.js";
import { Blacklisted } from "../database/models/blacklisted.js";
import { config } from "../utils/config.js";

export const e: event = async (client, interaction: BaseInteraction) => {
    const blCheck = await Blacklisted.findOne({
        where: {
            userId: interaction.user.id
        }
    });
    if (blCheck && !config.developerIds.includes(interaction.user.id)) return (interaction as RepliableInteraction).reply({
        content: "You are blacklisted for the following reason:\n" + blCheck.getDataValue("reason"),
        ephemeral: true
    });
    if (interaction.isChatInputCommand()) {
        const i = interaction as ChatInputCommandInteraction;
        try {
            const command = client.commands.get(i.commandName);
            if (!command) return interaction.reply("This command has no handler. This should be addressed");
            command.execute(client, i);
        }
        catch (e) {
            if (i.isRepliable()) i.reply("An error occured while executing this command");
            else (i as ChatInputCommandInteraction).editReply("An error occured while executing this command");
            console.error(e);
        }
    }
    else if (interaction.isButton()) {
        const i = interaction as ButtonInteraction;
        const id = i.customId.split("_")[0];
        try {
            const button = client.buttons.get(id);
            if (!button) return interaction.reply("This button has no handler. This should be addressed");
            button.execute(client, i);
        }
        catch (e) {
            if (!i.isRepliable())
                (i as ButtonInteraction).editReply("An error occured while executing this command");
            else i.reply("An error occured while executing this button interaction");
            console.error(e);
        }
    }
    else if (interaction.isStringSelectMenu()) {
        const i = interaction as StringSelectMenuInteraction;
        try {
            const stringselect = client.stringSelects.get(i.customId.split("_")[0]);
            if (!stringselect) return interaction.reply("This menu has no handler. This should be addressed");
            stringselect.execute(client, i);
        }
        catch (e) {
            if (!i.isRepliable()) (i as StringSelectMenuInteraction).editReply("An error occured while executing this command");
            else i.reply("An error occured while executing this button interaction");
            console.error(e);
        }
    }
    else if (interaction.isModalSubmit()) {
        const i = interaction as ModalSubmitInteraction;
        const id = i.customId.split("_")[0];
        try {
            const modal = client.modals.get(id);
            if (!modal) return interaction.reply("This modal has no handler. This should be addressed");
            modal.execute(client, i);
        }
        catch (e) {
            if (!i.isRepliable()) (i as ModalSubmitInteraction).editReply("An error occured while executing this command");
            else i.reply("An error occured while executing this button interaction");
            console.error(e);
        }
    }
    return;
};
