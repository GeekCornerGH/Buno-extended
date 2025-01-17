import { Collection } from "discord.js";

import { button } from "./button.js";
import { command } from "./command.js";
import { modal } from "./modal.js";
import { stringSelect } from "./stringSelect.js";
import { unoGame } from "./unoGame.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, command>,
        buttons: Collection<string, button>,
        modals: Collection<string, modal>,
        stringSelects: Collection<string, stringSelect>,
        games: unoGame[]
    }
}
