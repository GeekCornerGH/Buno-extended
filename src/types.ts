import { AnyTextableGuildChannel, Message } from "oceanic.js";

import { colors, uniqueVariants, variants } from "./constants.js";

export type Config = {
    prefix: string,
    emoteless: boolean,
    status: string | undefined,
    developerIds: string[],
    devPrefix: string,
    logChannel: string | undefined,
    title: string | undefined
}

export type Command = {
    name: string,
    aliases?: string[]
    execute: (msg: Message<AnyTextableGuildChannel>, args: string[]) => any;
}

export type PlayerStorage = {
    wins: number
    losses: number,
    preferredSettings: UnoGameSettings
}
export type GuildStorage = {
    settingsVersion: number
    // typescript jumpscare
} & {
    [userID: string]: PlayerStorage
}
export type PlayerStatsDatabaseInfo = {
    [guildID: string]: GuildStorage
}

export type DebugStateType = "delete-player" | "set-cards";
export interface DebugState {
    newState: string[],
    meetsEndCondition: [boolean, number]
}

export type Card = `${typeof colors[number]}-${typeof variants[number]}` | typeof uniqueVariants[number]

export type UnoGameSettings = {
    timeoutDuration: number,
    kickOnTimeout: boolean,
    allowSkipping: boolean,
    antiSabotage: boolean,
    allowStacking: boolean,
    randomizePlayerList: boolean,
    resendGameMessage: boolean,
    canJoinMidgame: "no" | "temporarily" | "permanently",
    sevenAndZero: boolean,
    shouldYellBUNO: boolean,
    reverseAnything: boolean
}
export type UnoGame<T extends boolean> = T extends true ? {
    uid: string,
    started: true,
    players: string[],
    playersWhoLeft: string[],
    host: string,
    cards: { [player: string]: Card[] },
    currentCard: Card,
    currentCardColor: typeof colors[number],
    deck: Card[],
    draw: (amount: number) => { cards: Card[], newDeck: Card[] },
    drawDuration: number,
    drawStackCounter: number,
    hasPlayed: boolean,
    unoPlayers: string[],
    currentPlayer: string,
    lastPlayer: {
        id: string,
        duration: number,
    },
    settings: UnoGameSettings,
    turn: number,
    saboteurs: { [id: string]: boolean },
    message: Message<AnyTextableGuildChannel>,
    channelID: string,
    guildID: string,
    _modified: boolean,
    _debug: {
        _state: {
            [k in DebugStateType]: (Omit<UnoGame<true>, "_debug" | "message" | "deck" | "settings"> & {
                action: DebugState,
                _index: number
            })[]
        },
        pushState(state: DebugState & { type: DebugStateType }): void
    }
} : {
    uid: string,
    started: false,
    starting: number,
    host: string,
    players: string[],
    settings: UnoGameSettings,
    message: Message<AnyTextableGuildChannel>,
    channelID: string,
    guildID: string,
    _allowSolo: boolean,
    _modified: boolean,
}
