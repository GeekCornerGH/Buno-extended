import { customClient } from "./client";

export type eventFile = { e: event }
export type event = (client: customClient, ...args: any) => void;
