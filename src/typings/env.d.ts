declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string
            CLIENTID: string
            IGNORED_PLAYERS?: string
            AI_BASE: string
            AI_TOKEN: string
        }
    }
}

export {};
