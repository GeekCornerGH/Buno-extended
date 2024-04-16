import { Client, Collection } from "discord.js";

import { button } from "./button";
import { command } from "./command";
import { modal } from "./modal";
import { stringSelect } from "./stringSelect";
import { unoGame } from "./unoGame";

export interface customClient extends Client {
    commands: Collection<string, command>,
    buttons: Collection<string, button>,
    modals: Collection<string, modal>,
    stringSelects: Collection<string, stringSelect>,
    games: unoGame[]
}
