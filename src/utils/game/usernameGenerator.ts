export default function generateUsername() {
    const adjectives: string[] = [
        "Quick",
        "Lazy",
        "Happy",
        "Bright",
        "Clever",
        "Brave",
        "Calm",
        "Kind",
        "Lovely",
        "Proud",
        "Silly",
        "Zealous",
        "Chill"
    ];

    const animals: string[] = [
        "Lion",
        "Tiger",
        "Bear",
        "Fox",
        "Wolf",
        "Rabbit",
        "Owl",
        "Cat",
        "Dog",
        "Parrot",
        "Eagle",
        "Shark",
        "Panda",
        "Koala",
        "Dolphin",
        "Penguin",
        "Giraffe",
        "Elephant"
    ];

    const getRandomElement = (array: string[]): string => {
        return array[Math.floor(Math.random() * array.length)];
    };

    const adjective = getRandomElement(adjectives);
    const animal = getRandomElement(animals);

    return `${adjective} ${animal}`;
}
