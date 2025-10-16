import { unoCard } from "../../typings/unoGame.js";

export default async function drawCards(quota: {
    [card: string]: number
}, amount: number, onlyDigits: boolean = false): Promise<unoCard[]> {
    const array = Object.entries(quota) as [unoCard, number][];
    const drawn: unoCard[] = [];

    for (let i = 0; i < amount; i++) {
        await new Promise(resolve => setImmediate(resolve));
        let pickedCard = array[Math.floor(Math.random() * array.length)];

        while (pickedCard[1] === 0
            || (onlyDigits === true && (pickedCard[0].endsWith("wild") || pickedCard[0].endsWith("+4")
                || pickedCard[0].endsWith("block") || pickedCard[0].endsWith("reverse")
                || pickedCard[0].endsWith("+2") || pickedCard[0].endsWith("0")))) {
            pickedCard = array[Math.floor(Math.random() * array.length)];
        }

        drawn.push(pickedCard[0]);
        quota[pickedCard[0]] -= 1;
    }
    return drawn;
}
