import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { ReadableStream } from "stream/web";

import { cardEmojis } from "./constants.js";

if (!existsSync(join(import.meta.dirname, "..", "..", "assets"))) mkdirSync(join(import.meta.dirname, "..", "..", "assets"));
for (const value of Object.values(cardEmojis)) {
    const [, name, id] = value.match(/<:(\w+):(\d+)>/)!;
    const res = await fetch("https://cdn.discordapp.com/emojis/" + id + ".png");
    const destination = resolve(import.meta.dirname, "..", "..", "assets", name + ".png");
    const stream = createWriteStream(destination, { flags: "wx" });
    await finished(Readable.fromWeb(res.body as ReadableStream).pipe(stream));
}
