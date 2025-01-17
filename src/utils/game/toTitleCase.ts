import { t } from "i18next";

export default (n: string, lng: string) => {
    const [color, variant] = n.split("-");
    return t(`strings:colors.${color}` as any, { lng }) + " " + t(`strings:variants.${variant}` as any, { lng });
};
