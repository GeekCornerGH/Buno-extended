# Buno-Extended  
#### A Discord bot for playing Uno™ on Discord  
  
## Disclaimer  
The Uno™ brand and logo, and the cards designs are owned by Mattel, Inc.  
This bot is not affiliated with Discord, Mattel, or Uno  
This project was created solely for educational purposes and does not intend to have a negative impact on the original works (in fact, it may have a positive impact).  
If you're authorized to act on behalf of Mattel, Inc. and wish to have the content removed, please open an [issue](/GeekCornerGH/buno-extended/issues/new), mention me (@GeekCornerGH) and provide evidence of your authorization to request the deletion of the copyrighted content. I'll remove it as soon as possible.

## Self-hosted setup  
### Requirements
* [NodeJS](https://nodejs.org/en/download) 20.11+
* [PNPM](https://pnpm.io/installation) (recommended)
* A [Discord bot application](https://discord.com/developers/applications)
* Optional: Discord servers to upload the emotes on (found in the [/assets folder](/GeekCornerGH/buno-extended/tree/main/assets))

### Setup
* Clone the repo
* Install dependencies:
    ```bash
    pnpm install
    ```
* Fill the `.env` file with your bot client id and token
* Create the emotes.json file
* Fill the config.toml file with the required values
* Using in a dev environment? Run
    ```bash
    pnpm dev
    ```
* Using in a prod environment? Run
    ```bash
    pnpm build
    ```
    to build the project and
    ```bash
    pnpm start
    ```
    to launch the bot, or run
    ```bash
    pnpm start:restart
    ```
    to keep the bot online on crash
* Deploy the slash commands by running
    ```bash
    pnpm scripts:deploySlash
    ```
* Migrating from v1? Run 
    ```bash
    pnpm scripts:migrate
    ```
    You may pass a coma-separated list in the `IGNORED_PLAYERS` environment variable (in the `.env` file) to ignore some players in the migration.
