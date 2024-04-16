export default function toHumanReadableTime(n: number) {
    if (n < 0) return "Disabled";

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;

    if (n < secondsInMinute) {
        return `${n} second${n === 1 ? "" : "s"}`;
    } else if (n < secondsInHour) {
        const m = Math.floor(n / secondsInMinute);
        const s = n % secondsInMinute;
        return `${m} minute${m === 1 ? "" : "s"}${s ? ` and ${s} second${s === 1 ? "" : "s"}` : ""}`;
    } else if (n < secondsInDay) {
        const h = Math.floor(n / secondsInHour);
        const m = Math.floor((n % secondsInHour) / secondsInMinute);
        const s = n % secondsInMinute;
        return `${h} hour${h === 1 ? "" : "s"}${m ? ` ${m} minute${m === 1 ? "" : "s"}` : ""}${s ? ` and ${s} second${s === 1 ? "" : "s"}` : ""}`;
    } else {
        const d = Math.floor(n / secondsInDay);
        const h = Math.floor((n % secondsInDay) / secondsInHour);
        const m = Math.floor((n % secondsInHour) / secondsInMinute);
        const s = n % secondsInMinute;
        return `${d} day${d === 1 ? "" : "s"}${h ? ` ${h} hour${h === 1 ? "" : "s"}` : ""}${m ? ` ${m} minute${m === 1 ? "" : "s"}` : ""}${s ? ` and ${s} second${s === 1 ? "" : "s"}` : ""}`;
    }
}
