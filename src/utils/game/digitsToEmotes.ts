export default function (number: number) {
    const numbers = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    return number.toString().split("").map(digit => numbers[parseInt(digit)]).join("");
}
