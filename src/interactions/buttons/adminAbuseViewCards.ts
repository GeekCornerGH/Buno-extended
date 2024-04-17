import { EmbedBuilder } from "discord.js";

import backToAdminAbuseHome from "../../components/backToAdminAbuseHome.js";
import { button } from "../../typings/button.js";
import { unoCard } from "../../typings/unoGame.js";
import { config } from "../../utils/config.js";
import { ButtonIDs, cardEmojis, cardEmotes } from "../../utils/constants.js";
import digitsToEmotes from "../../utils/game/digitsToEmotes.js";
import toTitleCase from "../../utils/game/toTitleCase.js";

export const b: button = {
    name: ButtonIDs.ADMIN_ABUSE_VIEW_CARDS,
    execute: async (client, interaction) => {
        const game = client.games.find(g => g.channelId === interaction.channelId);
        if (!game) return interaction.reply({
            content: "Cannot find the game you're talking about.",
            ephemeral: true
        });
        else if (game.state === "waiting") return interaction.reply({
            content: "The game hasn't started yet.",
            ephemeral: true
        });
        else if (game.currentPlayer !== interaction.user.id) return interaction.reply({
            content: "This is not your turn.",
            ephemeral: true
        });
        else if (!game.settings.adminabusemode || game.hostId !== interaction.user.id) return interaction.reply({
            content: "nuh uh ☝️",
            ephemeral: true
        });
        game.adminAbused = true;
        await interaction.deferUpdate();
        const embed = new EmbedBuilder()
            .setTitle("View cards")
            .setFields(
                ...game.players.map(p => {
                    return {
                        name: interaction.guild.members.cache.get(p).displayName,
                        value: (() => {
                            const cards = game.cards[p] as unoCard[];
                            const seenCards: unoCard[] = [];
                            const mapped = cards.map(c => {
                                if (seenCards.includes(c)) return;
                                seenCards.push(c);
                                return `${config.emoteless ? `${cardEmotes[c]} ${toTitleCase(c)}${cards[c] >= 2 ? ` x${cards[c]}` : ""}` : `${cardEmojis[c]}${cards[c] >= 2 ? ` :regional_indicator_x:${digitsToEmotes(cards[c])}` : ""}`}`;
                            });
                            return mapped.filter(v => v !== undefined).join(config.emoteless ? ", " : " ");
                        })()
                    };
                })
            );
        return interaction.editReply({
            embeds: [embed],
            components: [backToAdminAbuseHome()]
        });
    }
};
