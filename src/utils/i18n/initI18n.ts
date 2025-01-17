import i18next from "i18next";

import enStrings from "../../i18n/en/strings.json" with {type: "json"};
import frStrings from "../../i18n/fr/strings.json" with {type: "json"};

export default function () {
    i18next.init({
        fallbackLng: "en",
        resources: {
            en: {
                strings: enStrings
            },
            fr: {
                strings: frStrings
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
