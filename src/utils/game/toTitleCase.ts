import { t } from "i18next";

import { uniqueVariants } from "../constants.js";

export default (n: string, lng: string) => {
    const [color, variant] = n.split("-");
    if (uniqueVariants.includes(color as typeof uniqueVariants[number])) return t(`strings:variants.${color}` as any, { lng });
    return t("strings:cardFormat", { color: t(`strings:colors.${color}` as any, { lng }), variant: t(`strings:variants.${variant}` as any, { lng }), lng });
};
