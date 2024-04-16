export default (n: string) =>
    n.split("-").map(w => `${w[0].toUpperCase()}${w.slice(1).toLowerCase()}`).join(" ");
