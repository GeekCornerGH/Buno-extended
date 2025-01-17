import i18next from "i18next";

import enStrings from "../../i18n/en/strings.json";

export default function () {
    i18next.init({
        fallbackLng: "en",
        resources: {
            en: {
                strings: enStrings
            }
        },
        defaultNS: "strings",
        ns: ["strings"],
        interpolation: {
            escapeValue: false
        }
    }, (err: unknown) => {
        if (err) throw err;
    });
}
