import OpenAI from "openai";

const openAI = new OpenAI({
    baseURL: process.env.AI_BASE,
    apiKey: process.env.AI_TOKEN,
});

export default openAI;
