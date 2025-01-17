import { t } from "i18next";

export default function toHumanReadableTime(n: number, lng: string) {
    if (n < 0) return t("strings:time.disabled", { lng });

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;

    if (n < secondsInMinute) {
        return t("strings:time.s", { seconds: n, lng });
    } else if (n < secondsInHour) {
        const m = Math.floor(n / secondsInMinute);
        const s = n % secondsInMinute;
        return t("strings:time.ms", { seconds: s, minutes: m, lng });
    } else if (n < secondsInDay) {
        const h = Math.floor(n / secondsInHour);
        const m = Math.floor((n % secondsInHour) / secondsInMinute);
        const s = n % secondsInMinute;
        return t("strings:time.hms", { seconds: s, minutes: m, hours: h, lng });
    } else {
        const d = Math.floor(n / secondsInDay);
        const h = Math.floor((n % secondsInDay) / secondsInHour);
        const m = Math.floor((n % secondsInHour) / secondsInMinute);
        const s = n % secondsInMinute;
        return t("strings:time.dhms", { seconds: s, minutes: m, hours: h, days: d, lng });
    }
}
