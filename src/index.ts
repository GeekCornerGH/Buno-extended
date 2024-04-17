import { Client, Collection, GatewayIntentBits } from "discord.js";
import { configDotenv } from "dotenv";
import { readdirSync } from "fs";

import { buttonFile } from "../typings/button.js";
import { customClient } from "../typings/client.js";
import { commandFile } from "../typings/command.js";
import { eventFile } from "../typings/event.js";
import { modalFile } from "../typings/modal.js";
import { stringSelectFile } from "../typings/stringSelect.js";

configDotenv();

Error.stackTraceLimit = Infinity;


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
}) as customClient;

client.games = [];

const events = readdirSync(import.meta.dirname + "/events");
events.forEach(async (name: string) => {
    if (!name.endsWith(".js") && !name.endsWith(".ts")) return;
    const { e } = await import("file://" + import.meta.dirname + "/events/" + name) as eventFile;
    const propername = name.split(".")[0];
    client.on(propername, (...args) => e(client, ...args));
});

client.commands = new Collection();
const commands = readdirSync(import.meta.dirname + "/commands");
commands.forEach(async (name: string) => {
    if (!name.endsWith(".js") && !name.endsWith(".ts")) return;
    const { c } = await import("file://" + import.meta.dirname + "/commands/" + name) as commandFile;
    const propername = name.split(".")[0];
    client.commands.set(propername, c);
});

client.buttons = new Collection();
const buttons = readdirSync(import.meta.dirname + "/interactions/buttons/");
buttons.forEach(async (name: string) => {
    if (!name.endsWith(".js") && !name.endsWith(".ts")) return;
    const { b } = await import("file://" + import.meta.dirname + "/interactions/buttons/" + name) as buttonFile;
    client.buttons.set(b.name, b);
});

client.stringSelects = new Collection();
const stringSelects = readdirSync(import.meta.dirname + "/interactions/stringSelects/");
stringSelects.forEach(async (name: string) => {
    if (!name.endsWith(".js") && !name.endsWith(".ts")) return;
    const { s } = await import("file://" + import.meta.dirname + "/interactions/stringSelects/" + name) as stringSelectFile;
    client.stringSelects.set(s.name, s);
});

client.modals = new Collection();
const modals = readdirSync(import.meta.dirname + "/interactions/modals/");
modals.forEach(async (name: string) => {
    if (!name.endsWith(".js") && !name.endsWith(".ts")) return;
    const { m } = await import("file://" + import.meta.dirname + "/interactions/modals/" + name) as modalFile;
    client.modals.set(m.name, m);
});

client.login(process.env.TOKEN);

client.on("error", console.error);
process.on("unhandledRejection", console.error);
