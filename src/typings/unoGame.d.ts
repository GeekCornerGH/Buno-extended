import { ButtonInteraction, ChatInputCommandInteraction, Snowflake, StringSelectMenuInteraction } from "discord.js";

import { colors, uniqueVariants, variants } from "../utils/constants.js";

type waitingUnoGame = userWaitingUnoGame | guildWaitingGame;

interface userWaitingUnoGame extends baseWaitingUnoGame {
    guildApp: false,
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction
}
interface guildWaitingGame extends baseWaitingUnoGame {
    guildApp: true
}
type baseWaitingUnoGame = {
    state: "waiting",
    startsAt: number,
    locale: string,
    uid: string,
    guildId: string,
    channelId: Snowflake,
    messageId: Snowflake,
    hostId: Snowflake,
    players: Snowflake[]
    settings: unoSettings,
    _modified: boolean,
    guildApp: boolean,
    updateToken?: string,
    interaction: ChatInputCommandInteraction | ButtonInteraction
};

export type runningUnoGame = guildRunningGame | userRunningGame;
interface guildRunningGame extends baseRunningUnoGame {
    guildApp: true,
}
interface userRunningGame extends baseRunningUnoGame {
    guildApp: false,
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
    previousActions: string[],
    mentionId?: Snowflake
}

type baseRunningUnoGame = {
    state: "inProgress",
    locale: string,
    messageCount: number,
    uid: string,
    guildId: Snowflake,
    channelId: Snowflake,
    hostId: Snowflake,
    players: Snowflake[],
    playersWhoLeft: Snowflake[],
    startingDate: Date,
    messageId: Snowflake,
    turnProgress: "chooseCard" | "chooseColor" | "pickPlayer",
    playedCard?: typeof uniqueVariants[number] | `${typeof colors[number]}-7`,
    drawStack: number,
    canSkip: boolean;
    currentPlayer: Snowflake,
    settings: unoSettings,
    adminAbused: boolean,
    saboteurs: {
        [user: Snowflake]: number
    },
    unoPlayers: Snowflake[],
    _modified: boolean,
    currentCard: unoCard,
    log: unoLog[],
    turnCount: number,
    cardsQuota: {
        [card: string]: number
    }
    cards: {
        [user: string]: unoCard[];
    },
    jumpedIn: boolean,
    guildApp: boolean,
    interaction: ChatInputCommandInteraction | ButtonInteraction
};

export type unoGame = waitingUnoGame | runningUnoGame;

export type unoCard = `${typeof colors[number]}-${typeof variants[number]}` | `${typeof colors[number]}-${typeof uniqueVariants[number]}` | typeof uniqueVariants[number];

export type unoSettings = {
    timeoutDuration: number,
    kickOnTimeout: boolean,
    allowSkipping: boolean,
    antiSabotage: boolean,
    allowStacking: boolean,
    randomizePlayerList: boolean,
    resendGameMessage: boolean,
    canJoinMidgame: "temporarily" | "no" | "always",
    sevenAndZero: boolean,
    shouldYellBUNO: boolean,
    reverseAnything: boolean,
    allowContest: boolean,
    adminabusemode: boolean,
    jumpIn: boolean
};

export type unoStats = {
    wins: number,
    loses: number
};

export type unoLog = {
    player: string,
    card: unoCard,
    adminAbused?: boolean
}
