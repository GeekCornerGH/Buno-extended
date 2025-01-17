import { Client } from "discord.js";

export type eventFile = { e: event }
// eslint-disable-next-line no-unused-vars
export type event = (client: Client, ...args) => unknown | Promise<unknown>;
