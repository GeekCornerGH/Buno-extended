// import { readFileSync } from "fs";

import { readFileSync } from "fs";

import { unoCard, unoSettings } from "../typings/unoGame.js";
import { config } from "./config.js";

export const colors = ["red", "yellow", "green", "blue",] as const;
// eslint-disable-next-line no-unused-vars
export const colorEmotes: { [k in typeof colors[number] | "other"]: string } = {
    red: "🟥",
    yellow: "🟨",
    green: "🟩",
    blue: "🟦",
    other: "⬛"
} as const;

export const variants = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+2", "reverse", "block",] as const;
export const uniqueVariants = ["wild", "+4",] as const;

export const averageUnoGameCount = () => {
    const data: {
        [card: string]: number
    } = {};
    colors.forEach(c => {
        variants.forEach(v => {
            if (v === "0") data[`${c}-${v}`] = 1;
            else data[`${c}-${v}`] = 2;
        });
    });
    uniqueVariants.forEach(v => {
        data[v] = 4;
    });
    return data;
};


export const cards = colors
    .map(c => variants.map(v => `${c}-${v}`))
    .flat()
    .concat(uniqueVariants) as ReadonlyArray<unoCard>;

// eslint-disable-next-line no-unused-vars
export let cardEmojis: { [k in unoCard]: string };
try {
    cardEmojis = Object.freeze(JSON.parse(readFileSync(import.meta.dirname + "/../../emotes.json", "utf8")));
} catch (e) {
    console.error("Failed to read emotes.json. This most likely means you forgot to rename emotes.json.example; please keep the file even if using emoteless mode");
    console.log(e);
    setTimeout(() => process.exit(1), 30_000);
}

// eslint-disable-next-line no-unused-vars
export let cardEmotes: { [k in unoCard]: string };
// this has to be some of the most insane code Sunnie has written
setImmediate(() => cardEmotes = config.emoteless
    ? colors
        .map(c => variants.map(v => [`${c}-${v}`, colorEmotes[c]]))
        .concat([uniqueVariants.map(v => [v, colorEmotes.other])])
        // eslint-disable-next-line no-unused-vars
        .reduce((obj: { [key: string]: string }, val) => { val.forEach(([k, v]) => obj[k] = v); return obj; }, {}) as { [k in unoCard]: string }
    : cardEmojis
);

// eslint-disable-next-line no-unused-vars
export const coloredUniqueCards: { [k in `${typeof colors[number]}-${typeof uniqueVariants[number]}`]: string } = {
    "red-wild": "<:Wr:1083073403197587476>",
    "red-+4": "<:4r:1083073363360108545>",
    "yellow-wild": "<:Wy:1083073405793873940>",
    "yellow-+4": "<:4y:1083073365641801849>",
    "green-wild": "<:Wg:1083073401469542460>",
    "green-+4": "<:4g:1083073361875325071>",
    "blue-wild": "<:Wb:1083073398374137917>",
    "blue-+4": "<:4b:1083073359404867716>"
};

export const rainbowColors = [
    0xf38ba8,
    0xfab387,
    0xf9e2af,
    0xa6e3a1,
    0x89b4fa,
    0xcba6f7,
    0xf5c2e7
] as const;
export const defaultColor = 0x6c7086;

export const defaultSettings: unoSettings = {
    timeoutDuration: 150,
    kickOnTimeout: true,
    allowSkipping: false,
    antiSabotage: true,
    allowStacking: true,
    randomizePlayerList: true,
    resendGameMessage: true,
    canJoinMidgame: "temporarily",
    sevenAndZero: false,
    shouldYellBUNO: true,
    reverseAnything: false,
    allowContest: true,
    adminabusemode: false
} as const;

export const maxRejoinableTurnCount = 30;

export const autoStartTimeout = (5 * 60 + 5) * 1000;

// do NOT use "__" in any id's
export const ButtonIDs = Object.freeze({
    JOIN_GAME: "join",
    LEAVE_GAME_BEFORE_START: "leave",
    EDIT_GAME_SETTINGS: "game-settings",
    DELETE_GAME: "delete-game",
    START_GAME: "start",
    VIEW_CARDS: "view-cards",
    PLAY_CARD: "play-game",
    LEAVE_GAME: "leave-game",
    JOIN_MID_GAME: "join-ongoing",
    LEAVE_GAME_CONFIRMATION_YES: "confirm-leave-game",
    LEAVE_GAME_CONFIRMATION_NO: "deny-leave-game",
    VIEW_GAME_SETTINGS: "view-settings",
    ACTIONS_MENU: "action-menu",
    CONTEST_PLUS4: "contest-+4",
    ADMINABUSE_PANEL: "open-admin-abuse-panel",
    CONTEST_ADMIN_ABUSE: "contest-admin-abuse",
    SHOUT_UNO: "shout-uno",
    CONTEST_SHOUT_UNO: "contest-buno-shout",
    LEADERBOARD_NEXT: "leaderboard-next",
    LEADERBOARD_PREVIOUS: "leaderboard-previous",
    ADMIN_ABUSE_VIEW_CARDS: "view-other-players-cards",
    ADMIN_ABUSE_EDIT_CARDS: "edit-other-players-cards",
    ADMIN_ABUSE_SWAP_CARDS: "swap-cards-between-2-players",
    DISABLED_BUTTON: "Never gonna give you up you curious :v"
});

export const SelectIDs = Object.freeze({
    CHOOSE_CARD: "choose-card",
    CHOOSE_CARD_ABOVE_25: "choose-card-2",
    CHOOSE_COLOR: "choose-color",
    FORCEFUL_DRAW: "draw-or-stack",
    PLAYER_USER_SELECT: "select-player-user",
    EDIT_GAME_SETTINGS: "change-settings",
    ADMIN_ABUSE_PLAYER_CARDS_EDIT: "admin-abuse-edit-player-cards",
    ADMIN_ABUSE_SWAP_CARDS_FROM: "swap-cards-from-player-aa",
    ADMIN_ABUSE_SWAP_CARDS_TO: "swap-cards-to-player-aa"

});

export const ModalsIDs = Object.freeze({
    ADMIN_ABUSE_EDIT_CARDS: "admin-abuse-edit-cards-modal",
    ADMIN_ABUSE_EDIT_CARDS_FIELD: "admin-abuse-edit-cards-field"

});

export const SettingsIDs = Object.freeze({
    TIMEOUT_DURATION: "timeout-duration-setting",
    KICK_ON_TIMEOUT: "kick-on-timeout",
    ANTI_SABOTAGE: "anti-sabotage",
    RANDOMIZE_PLAYER_LIST: "randomize-list",
    RESEND_GAME_MESSAGE: "resend-game-message",
    ALLOW_REJOINING: "can-rejoin",

    ALLOW_SKIPPING: "allow-skipping",
    ALLOW_CARD_STACKING: "allow-stacking",
    SEVEN_AND_ZERO: "7-and-0",
    SHOULD_YELL_BUNO: "should-shout-uno",

    TIMEOUT_DURATION_MODAL: "timeout-duration-modal",
    TIMEOUT_DURATION_MODAL_SETTING: "timeout-setting-field",
});

export const maxDrawAsSabotage = 4;

export const maxWeightBeforeResend = 20;

// It is recommended to not allow more than 12 users
export const maxPlayerInGame = 12;
