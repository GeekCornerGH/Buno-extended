export default function <T>(array: T[], n: number, times: number = 1) {
    const nextPosition = (n + times) % array.length;
    return array[nextPosition];
}
