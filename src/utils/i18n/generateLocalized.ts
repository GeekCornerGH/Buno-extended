import i18next, { TFunction } from "i18next";

export default function (key: Parameters<TFunction>[0]) {
    const localizations: Record<string, string> = {};
    for (const lng of Object.keys(i18next.services.resourceStore.data)) {
        if (lng !== "en") {
            const translation = i18next.t(key as any, { lng });
            if (translation !== key) {
                localizations[lng] = translation;
            }
        }
    }
    return localizations;
}
