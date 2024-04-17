import { customClient } from "./client.js";

export type eventFile = { e: event }
export type event = (client: customClient, ...args: any) => void;
