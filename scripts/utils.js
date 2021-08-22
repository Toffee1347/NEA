import hideCursor from "hide-terminal-cursor";
import { createInterface } from "readline";
import showCursor from "show-terminal-cursor";
const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
});

export function input(text, clear = true) {
    if (clear) console.clear();
    showCursor();
    return new Promise((res) => {
        readline.question(text, (output) =>{
            hideCursor();
            res(output);
        });
    });
}