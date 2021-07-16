import keypress from 'keypress';
import chalk from 'chalk';

let active = false;
let info = {
    text: null,
    options: null,
    numbers: null,
    selected: null,
    resolve: null,
};

keypress(process.stdin);
 
process.stdin.on('keypress', function (ch, key) {
    if (active) {
        if (key.name === 'up' || key.name === 'down') {
            if (key.name === 'up') {
                info.selected--;
                if (info.selected < 0) info.selected = 0;
            }
            else if (key.name === 'down') {
                info.selected++;
                if (info.selected > info.options.length - 1) info.selected = info.options.length - 1;
            };
            reset();
        }
        else if (key.name === 'return') {
            info.resolve(info.selected);
            console.clear();
            info = {
                text: null,
                options: null,
                numbers: null,
                selected: null,
                resolve: null,
            };
            active = false;
        };
    };
});
 
process.stdin.setRawMode(true);
process.stdin.resume();
export function selector(text, options, numbers = true) {
    active = true;
    info.text = text;
    info.options = options;
    info.numbers = numbers;
    info.selected = 0;

    reset();
    return new Promise((res) => info.resolve = res);
};

function reset() {
    console.clear();
    console.log(`${info.text}\n${(info.options.map((value, index) => `${index !== 0 ? '\n' : ''}${info.selected === index ? chalk.inverse(`   ${info.numbers ? `${index + 1}) ` : ''}${value}`) : `   ${info.numbers ? `${index + 1}) ` : ''}${value}`}`)).join('')}`);
};