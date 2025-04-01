import { ChatModel } from "openai/resources/shared.js";

import { AIPrompt } from "./src/utils/constants.js";
import openAIClient from "./src/utils/openAIClient.js";

const conversation = await openAIClient.chat.completions.create({
    model: "mistral-medium" as unknown as ChatModel,
    messages: [{
        role: "system",
        content: AIPrompt
    }, {
        role: "assistant",
        content: "OK"
    }, {
        role: "user",
        content: `{
        "username": "awesome-balena",
        "cards": ["wild", "+4"],
        "previousActions": [{
            "card": "yellow-7",
            "player":"1"
        }]
        }`
    }],
    max_tokens: 50,
    temperature: 0,
    response_format: { type: "json_object" }
});
console.dir(conversation, { depth: Infinity });
