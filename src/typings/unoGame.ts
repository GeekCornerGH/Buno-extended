import { colors, uniqueVariants, variants } from "../utils/constants.js";

type waitingUnoGame = {
    state: "waiting",
    uid: string,
    guildId: string,
    channelId: string,
    messageId: string,
    hostId: string,
    players: string[]
    settings: unoSettings,
    _modified: boolean
};

export type runningUnoGame = {
    state: "inProgress",
    messageCount: number,
    uid: string,
    guildId: string,
    channelId: string,
    hostId: string,
    players: string[],
    playersWhoLeft: string[],
    startingDate: Date,
    messageId: string,
    turnProgress: "chooseCard" | "chooseColor" | "pickPlayer",
    playedCard?: typeof uniqueVariants[number] | `${typeof colors[number]}-7`,
    drawStack: number,
    canSkip: boolean;
    currentPlayer: string,
    settings: unoSettings,
    adminAbused: boolean,
    saboteurs: {
        [user: string]: number
    },
    unoPlayers: string[],
    _modified: boolean,
    currentCard: unoCard,
    log: unoLog[],
    turnCount: number,
    cardsQuota: {
        [card: string]: number
    }
    cards: {
        [user: string]: string[];
    }
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
