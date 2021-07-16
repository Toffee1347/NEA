import { createInterface } from "readline";
const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
});

export function input(text) {
    return new Promise((res) => {
        readline.question(text, (output) => res(output));
    });
};