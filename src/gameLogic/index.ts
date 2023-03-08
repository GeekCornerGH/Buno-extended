import { client, sendMessage } from "../client.js"
import { ButtonStyles, ComponentInteraction, ComponentTypes, MessageActionRow, ModalSubmitInteraction } from "oceanic.js"
import { Card, UnoGame } from "../types.js"
import { ComponentBuilder, EmbedBuilder } from "@oceanicjs/builders"
import { makeSettingsModal, onGameJoin, onSettingsChange } from "./notStarted.js"
import { leaveGame, onGameButtonPress } from "./started.js"
import { cardEmotes, defaultColor, rainbowColors, SelectIDs, ButtonIDs, uniqueVariants, cards, GameButtons, SettingsIDs, defaultSettings, SettingsSelectMenu, coloredUniqueCards } from "../constants.js"
import { onCardPlayed, onColorPlayed, onForceDrawPlayed } from "./playedCards.js"

export const games: { [channelId: string]: UnoGame<boolean> } = {}
export function hasStarted(game: UnoGame<boolean>): game is UnoGame<true> {
    return game.started
}
export function shuffle<T>(array: T[]): T[] {
    return array
        .map(c => ({ c, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ c }) => c)
}
export const toTitleCase = (n: string) => n.split("-").map(w => `${w[0].toUpperCase()}${w.slice(1).toLowerCase()}`).join(" ")
export function next(array: any[], n: number) {
    if (n < array.length - 1) return array[n + 1]
    else return array[0]
}
export const wasLastTurnBlocked = (game: UnoGame<true>) =>
    game.currentCard === "+4" || ["+2", "block"].includes(game.currentCard.split("-")[1])
export const cardArrayToCount = (a: Card[]) => a
    .sort((a, b) => cards.indexOf(a) - cards.indexOf(b))
    .reduce((obj, c) => { obj[c] = (obj[c] + 1) || 1; return obj }, {} as { [k in Card]: number })
export const getPlayerMember = (game: UnoGame<boolean>, player: string) => game.message.channel.guild.members.get(player)
export function cancelGameMessageFail(game: UnoGame<boolean>) {
    getPlayerMember(game, game.host).user.createDM()
        .then(ch => ch.createMessage({ content: "Cancelling game as the bot is unable to send messages" }))
        .catch(() => { })
    delete games[game.message.channel.id]
}

export function onTimeout(game: UnoGame<true>) {
    const kickedPlayer = getPlayerMember(game, game.currentPlayer)
    game.currentPlayer = next(game.players, game.players.indexOf(game.currentPlayer))
    if (game.settings.kickOnTimeout) game.players.splice(game.players.indexOf(game.currentPlayer), 1)
    sendMessage(game.message.channel.id,
        `**${kickedPlayer?.nick ?? kickedPlayer?.username}** was ${game.settings.kickOnTimeout ? "removed" : "skipped"} for inactivity`
    )
    if (game.players.length <= 1) {
        clearTimeout(game.timeout)
        delete games[game.message.channel.id]
        return sendMessage(game.message.channel.id, {
            content: `**${client.users.get(game.players[0])?.username ?? "Nobody"}** won by default`,
            components: new ComponentBuilder<MessageActionRow>()
                .addInteractionButton({
                    style: ButtonStyles.SUCCESS,
                    emoji: ComponentBuilder.emojiToPartial("🏆", "default"),
                    disabled: true,
                    customID: "we-have-a-nerd-here🤓"
                })
                .toJSON()
        })
    }
    sendGameMessage(game)
}

export function makeStartMessage(game: UnoGame<false>) {
    return new EmbedBuilder()
        .setTitle("The Buno.")
        .setDescription(`
Current game host: ${client.users.get(game.host)?.username ?? `<@${game.host}>`}
\`\`\`
${game.players.map(p => client.users.get(p)?.username ?? `Unknown [${p}]`).join("\n")}
\`\`\`
    `)
        .setColor(defaultColor)
        .toJSON()
}
const makeGameLine = (game: UnoGame<true>, playerID: string, i: number) =>
    `${game.players.indexOf(game.currentPlayer) === i ? "+ " : game.cards[playerID]?.length <= 2 ? "- " : "  "}${client.users.get(playerID)?.username ?? `Unknown [${playerID}]`}: ${game.cards[playerID].length} card${game.cards[playerID].length === 1 ? "" : "s"}`
export function sendGameMessage(game: UnoGame<true>) {
    const { id } = game.message.channel
    sendMessage(id, {
        content: `<@${game.currentPlayer}> it's now your turn`,
        allowedMentions: { users: true },
        embeds: [new EmbedBuilder()
            .setTitle("The Buno.")
            .setDescription(`
    Currently playing: **${client.users.get(game.currentPlayer)?.username ?? `<@${game.currentPlayer}>`}**
    Current card: ${uniqueVariants.includes(game.currentCard as any) ? coloredUniqueCards[`${game.currentCard}-${game.currentCardColor}`] : cardEmotes[game.currentCard]} \
    ${toTitleCase(game.currentCard)} \
    ${uniqueVariants.includes(game.currentCard as typeof uniqueVariants[number]) ? ` (${game.currentCardColor})` : ""} \
    ${game.drawStackCounter ? `\nNext player must draw **${game.drawStackCounter}** cards` : ""}
    \`\`\`diff
    ${game.players.map((p, i) => makeGameLine(game, p, i)).join("\n")}
    \`\`\`
    `)
            .setThumbnail(`https://cdn.discordapp.com/emojis/${cardEmotes[game.currentCard].match(/<:\w+:(\d+)>/)[1]}.png`)
            .setColor(rainbowColors[game.players.indexOf(game.currentPlayer) % 7] || defaultColor)
            .toJSON()],
        components: GameButtons
    }).then(msg => {
        if (!msg) return cancelGameMessageFail(game)
        game.message = msg
        games[id] = game
    })
}

export function onButtonPress(ctx: ComponentInteraction<ComponentTypes.BUTTON>) {
    ctx.deferUpdate()

    const game = games[ctx.channel.id]
    switch (ctx.data.customID as typeof ButtonIDs[keyof typeof ButtonIDs]) {
        case ButtonIDs.JOIN_GAME:
        case ButtonIDs.LEAVE_GAME_BEFORE_START:
        case ButtonIDs.START_GAME:
        case ButtonIDs.DELETE_GAME:
        case ButtonIDs.EDIT_GAME_SETTINGS:
            if (!game || hasStarted(game)) return
            onGameJoin(ctx, game)
            break
        case ButtonIDs.PLAY_CARD:
        case ButtonIDs.LEAVE_GAME:
            if (!game || !hasStarted(game)) return
            onGameButtonPress(ctx, game)
            break
        case ButtonIDs.LEAVE_GAME_CONFIRMATION_YES:
            if (!game || !hasStarted(game)) return
            leaveGame(ctx, game)
            break
        case ButtonIDs.LEAVE_GAME_CONFIRMATION_NO:
            ctx.deleteOriginal()
            break
    }
}

export function onSelectMenu(ctx: ComponentInteraction<ComponentTypes.STRING_SELECT>) {
    if (ctx.data.customID === SelectIDs.EDIT_GAME_SETTINGS) {
        if (ctx.data.values.raw[0] === SettingsIDs.TIMEOUT_DURATION) return makeSettingsModal(ctx)
    }
    ctx.deferUpdate()
    const game = games[ctx.channel.id]
    if (!game) return
    if (ctx.data.customID === SelectIDs.CHOOSE_CARD && hasStarted(game)) onCardPlayed(ctx, game)
    else if (ctx.data.customID === SelectIDs.CHOOSE_COLOR && hasStarted(game)) onColorPlayed(ctx, game)
    else if (ctx.data.customID === SelectIDs.FORCEFUL_DRAW && hasStarted(game)) onForceDrawPlayed(ctx, game)
    else if (ctx.data.customID === SelectIDs.EDIT_GAME_SETTINGS && !hasStarted(game)) onSettingsChange(ctx, game)
}

export function onModalSubmit(ctx: ModalSubmitInteraction) {
    ctx.deferUpdate()
    if (ctx.data.customID === SettingsIDs.TIMEOUT_DURATION_MODAL) {
        const game = games[ctx.channel.id]
        if (!game || hasStarted(game)) return
        const [timeoutDurationRaw] = ctx.data.components.map(i => i.components[0].value)
        let timeoutDuration = parseInt(timeoutDurationRaw.replace(/[ .,_]/gm, ""), 10)
        if (Number.isNaN(timeoutDuration)) ({ timeoutDuration } = defaultSettings)
        if (timeoutDuration < 0 || timeoutDuration > 3600) timeoutDuration = Number.MAX_SAFE_INTEGER // :slight_smile:
        if (timeoutDuration < 20) timeoutDuration = 20
        game.settings.timeoutDuration = timeoutDuration
        games[ctx.channel.id] = game
        ctx.editOriginal({
            components: SettingsSelectMenu(game)
        })
    }
}
