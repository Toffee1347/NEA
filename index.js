import { selector, waitForKey } from './scripts/selector.js';
import { fetchMusic } from './scripts/fetchMusic.js';
import * as dbhandler from './scripts/dbhandler.js';
import { input } from './scripts/utils.js';

const currentPlayer = {
    logedIn: false,
    id: null,
    username: null,
    topScore: null,
    shownSongs: [],
    points: 0,
    round: 0
}

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
            main('Songs Refreshed!');
        break;
        case 3:
            process.exit();
        break;
    }
}

async function scoreboard() {
    const accounts = dbhandler.allAccounts();
    const highScores = [];
    accounts.sort((a, b) => b.topScore - a.topScore);
    
    console.clear();
    console.log('High Scores:');
    accounts.forEach((account, index) => {
        if (index > 4) return;
        console.log(`   ${index + 1}) ${account.username} - ${account.topScore}`);
    });
    await waitForKey();
    main();
}

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
                currentPlayer.topScore = dbRes.topScore
                return main(`Account sucsesfully created!\nYour details are:\n   Username: ${username}\n   Password: ${password}`);
            break;
        }
    }
    else {
        await passwordCheck(dbRes);
    }

    main('Logged in successfully!');
}
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
        switch(await selector('Your password was inncorrect! Would you like to try again?', ['Yes', 'No'], false)) {
            case 0:
                return passwordCheck(account);
            break;
            case 1:
                return false;
            break;
        }
    }
}

async function startGame() {
    console.log(`Hi ${currentPlayer.username}, the rules of this game are:\n   •A random song name and artist will be chosen\n   •You will see the first letter of each word in the song title\n   •You have two chances to guess the title of the song\n   •If you get it right first try, you get 3 points and if you get it right second try, you get 1 point\n   •The game will end when you make an inncorrect second guess of each round`);
    await waitForKey();

    currentPlayer.shownSongs = [];
    currentPlayer.points = 0;
    currentPlayer.round = 0;
    gameRound();
}
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
            `Song name: ${songName}`,
            `Artist: ${song.artist}\n`,
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
                dbhandler.updateScore({id: currentPlayer.id, topScore: points});
            };
            await waitForKey();
            return main();
        }
    }
}

main();