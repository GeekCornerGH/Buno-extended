import { unoCard } from "../../typings/unoGame.js";

export default (quota: {
    [card: string]: number
}, amount: number, onlyDigits: boolean = false): unoCard[] => {
    const array = Object.entries(quota) as [unoCard, number][];
    const drawed: unoCard[] = [];
    [...Array(amount)].forEach(() => {
        let pickedCard = array[Math.floor(Math.random() * array.length)];
        while (pickedCard[1] === 0 || (onlyDigits === true && (pickedCard[0].endsWith("wild") || pickedCard[0].endsWith("+4") || pickedCard[0].endsWith("block") || pickedCard[0].endsWith("reverse") || pickedCard[0].endsWith("+2") || pickedCard[0].endsWith("0")))) pickedCard = array[Math.floor(Math.random() * array.length)];
        drawed.push(pickedCard[0]);
        quota[pickedCard[0]] -= 1;
    });
    return drawed;
};
