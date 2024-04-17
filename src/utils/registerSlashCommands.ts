import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { configDotenv } from "dotenv";
import { readdirSync } from "fs";

import { commandFile } from "../typings/command.js";

configDotenv();

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

const cmds = readdirSync(import.meta.dirname + "/../commands");
cmds.forEach(async f => {
    console.log("Processing " + f);
    if (!f.endsWith(".ts") && !f.endsWith(".js")) return;
    const { c } = await import("file://" + import.meta.dirname + "/../commands/" + f) as commandFile;
    if (!c.data || !c.execute) throw new Error("Please fix this command: " + f);
    commands.push(c.data.toJSON());

    if (cmds.length === commands.length) {
        const rest = new REST().setToken(process.env.TOKEN);
        (async () => {
            try {
                console.log("Pushing " + commands.length + " commands");
                await rest.put(Routes.applicationCommands(process.env.CLIENTID), { body: commands });
            }
            catch (e) {
                throw e;
            }
        })();
    }
});
