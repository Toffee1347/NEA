import { input } from './scripts/utils.js';
import { selector } from './scripts/selector.js';
import { addAccount, checkAccount } from './scripts/dbhandler.js';


async function main() {
    let option = await selector('Welcome to the music quiz!', ['Play', 'Scoreboard', 'Exit'], false);
    if (option === 0) {
        addAccount({
            username: 'Toffee1347',
            password: 'hi',
        });
        const username = await input('Please enter your username:  ');
        const password = await input(`Hi ${username}, Please enter your passord:  `);
        console.log(checkAccount({username, password}));
    }
    else if (option === 1) {
        
    }
    else if (option === 2) {
        process.exit();
    };
};
main();