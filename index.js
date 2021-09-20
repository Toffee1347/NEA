import { selector, waitForKey } from './scripts/selector.js';
import { fetchMusic } from './scripts/fetchMusic.js';
import * as dbhandler from './scripts/dbhandler.js';
import { input } from './scripts/utils.js';
import hideCursor from 'hide-terminal-cursor';
import showCursor from 'show-terminal-cursor';

// currentPlayer tracks the current user that is logged in so that they don't need to login again each time
const currentPlayer = {
    logedIn: false,
    id: null,
    username: null,
    topScore: null,
    shownSongs: [],
    points: 0,
    round: 0
}

// main is run each time you want the game to go back to the home screen e.g. after the end of the game
async function main(text = '') {
    switch (await selector(`${text !== '' ? text + '\n\n' : ''}Welcome to the music quiz!`, ['Play', 'Scoreboard', 'Refresh Songs', 'Exit'], false)) {
        case 0:
            if (currentPlayer.logedIn) startGame();
            else logIn();
        break;
        case 1:
            scoreboard();
        break;
        case 2:
            hideCursor();
            const stages = ['|', '/', '--', '\\'];
            let running = true;
            let count = -1;
            function text() {
                if (!running) return;
                count++;
                count %= 4;
                console.clear();
                console.log(`Refreshing ${stages[count]}`);
                setTimeout(text, 200);
            }
            text();
            await fetchMusic();
            running = false;
            showCursor();
            main('Songs Refreshed!');
        break;
        case 3:
            process.exit();
        break;
    }
}

async function scoreboard() {
    hideCursor();
    const accounts = dbhandler.allAccounts();
    const highScores = [];
    accounts.sort((a, b) => b.topScore - a.topScore); // Sorts the array into the right order
    
    console.clear();
    console.log('High Scores:');
    accounts.forEach((account, index) => {
        if (index > 4) return;
        console.log(`   ${index + 1}) ${account.username} - ${account.topScore}`);
    });
    await waitForKey();
    showCursor();
    main();
}

// logIn is run when you want the user to be promted to login, it also handles creating new accounts
async function logIn() {
    const username = await input('Please enter your username:  ');

    let dbRes = dbhandler.testAcccountUsername({username});
    if (!dbRes) {
        switch (await selector(`Looks like you don\'t have an account ${username}, would you like to make one?`, ['Yes', 'No'], false)) {
            case 0:
                const password = await input('Please choose a password:   ');
                dbhandler.addAccount({username, password});
                const { id } = dbhandler.testAcccountUsername({username});
                currentPlayer.logedIn = true;
                currentPlayer.id = id;
                currentPlayer.username = username;
                currentPlayer.topScore = 0;
                return main(`Account sucsesfully created!\nYour details are:\n   Username: ${username}\n   Password: ${password}`);
            break;
            case  1:
                return main();
            break;    
        }
    }
    else {
        await passwordCheck(dbRes);
    }

    main('Logged in successfully!');
}
// passwordCheck is run to check if the user has entered the correct password
async function passwordCheck(account) {
    const password = await input(`Hi ${account.username}, Please enter your passord:  `);
    if (password == account.password) {
        currentPlayer.logedIn = true;
        currentPlayer.id = account.id;
        currentPlayer.username = account.username;
        currentPlayer.topScore = account.topScore;
        return true;
    }
    else {
        switch(await selector('Your password was incorrect! Would you like to try again?', ['Yes', 'No'], false)) {
            case 0:
                return passwordCheck(account);
            break;
            case 1:
                return false;
            break;
        }
    }
}

// startGame is run to prompt the user to start the game and will tell the the rules
async function startGame() {
    console.log(`Hi ${currentPlayer.username}, the rules of this game are:\n   •A random song name and artist will be chosen\n   •You will see the first letter of each word in the song title\n   •You have two chances to guess the title of the song\n   •If you get it right first try, you get 3 points and if you get it right second try, you get 1 point\n   •The game will end when you make an incorrect second guess of each round`);
    await waitForKey();

    currentPlayer.shownSongs = [];
    currentPlayer.points = 0;
    currentPlayer.round = 0;
    gameRound();
}
// gameRound is run from the startGame and gameRound function to trigger the start of a round of the game
async function gameRound() {
    if (currentPlayer.shownSongs.length === 100) currentPlayer.shownSongs = [];
    currentPlayer.round++;

    let song = Math.round(Math.random() * 100);
    while (currentPlayer.shownSongs.includes(song)) song = Math.round(Math.random() * 100);
    currentPlayer.shownSongs.push(song);

    song = dbhandler.getSong({id: song});
    console.clear();
    
    const songName = `${song.name.split(' ').map((word) => (word[0] + ('_').repeat(word.substring(1).length))).join(' ')}`;

    let string = [
        `Round: ${currentPlayer.round}   Points: ${currentPlayer.points}   Guesses Left: 2\n`,
        `Song name: ${songName}`,
        `Artist: ${song.artist}\n`,
        'Please enter your guess:   '
    ];
    let guess = await input(string.join('\n'));

    console.clear();

    if (guess.toLowerCase() === song.name.toLowerCase()) {
        currentPlayer.points += 3;
        gameRound();
    }
    else {
        string = [
            `Round: ${currentPlayer.round}   Points: ${currentPlayer.points}   Guesses Left: 1\n`,
            'Incorrect! Try again\n',
            `   Song name: ${songName}`,
            `   Artist: ${song.artist}\n`,
            'Please enter your guess:   '
        ];
        guess = await input(string.join('\n'));

        if (guess.toLowerCase() === song.name.toLowerCase()) {
            currentPlayer.points += 1;
            gameRound();
        }
        else {
            console.clear();
            console.log(`Incorrect again, the answer was: ${song.name} by ${song.artist}! You lasted ${currentPlayer.round} round${currentPlayer.round !== 1 ? 's' : ''} and finished with ${currentPlayer.points} point${currentPlayer.points !== 1 ? 's' : ''}`);
            if (currentPlayer.points > currentPlayer.topScore) {
                dbhandler.updateScore({id: currentPlayer.id, topScore: currentPlayer.points});
            };
            await waitForKey();
            return main();
        }
    }
}

main();