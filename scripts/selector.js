import chalk from 'chalk';
import showCursor from 'show-terminal-cursor';
import hideCursor from 'hide-terminal-cursor';
import readline from 'readline';

let active = false;
let keyPress = false;
let info = {
    text: null,
    options: null,
    numbers: null,
    selected: null,
    resolve: null,
};

readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', function (ch, key) {
    if (key.name === 'c' && key.control) return process.exit();
    
    if (keyPress) {
        keyPress = false;
        info.resolve(true);
        info.resolve = null;
        console.clear();
    }
    else if (active) {
        if (key.name === 'up' || key.name === 'down') {
            if (key.name === 'up') {
                info.selected--;
                if (info.selected < 0) info.selected = 0;
            }
            else if (key.name === 'down') {
                info.selected++;
                if (info.selected > info.options.length - 1) info.selected = info.options.length - 1;
            }
            reset();
        }
        else if (key.name === 'return') {
            info.resolve(info.selected);
            showCursor();
            console.clear();
            info = {
                text: null,
                options: null,
                numbers: null,
                selected: null,
                resolve: null,
            }
            active = false;
        }
    }
});
process.stdin.on('resize', () => {
    reset();
});

process.stdin.setRawMode(true);
process.stdin.resume();

export function selector(text, options, numbers = true) {
    hideCursor();
    active = true;
    info.text = text;
    info.options = options;
    info.numbers = numbers;
    info.selected = 0;

    reset();
    return new Promise((res) => info.resolve = res);
}

export function waitForKey(text = 'Press any key to continue...') {
    console.log(text);
    keyPress = true;
    return new Promise((res) => info.resolve = res);
}

function reset() {
    console.clear();
    const text = info.text;
    const options = info.options.map((value, index) => {
        const whiteSpaceSize = process.stdout.columns - 3 - value.length - (info.numbers ? (`${index + 1}) `).size : '');
        return (
            '\n' + (info.selected === index ? chalk.inverse(`   ${info.numbers ? `${index + 1}) ` : ''}${value}${(' ').repeat(whiteSpaceSize)}`) : `   ${info.numbers ? `${index + 1}) ` : ''}${value}`)
        );
    }).join('');
    console.log(text + options);
}