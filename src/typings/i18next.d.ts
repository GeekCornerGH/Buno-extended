import "i18next";

import strings from "../i18n/en/strings.json";

const resources = { strings } as const;

declare module "i18next" {
    interface CustomTypeOptions {
        resources: typeof resources,
        defaultNS: "strings"
    }
}
