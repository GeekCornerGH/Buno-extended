declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string
            CLIENTID: string
            IGNORED_PLAYERS?: string
        }
    }
}

export {};
