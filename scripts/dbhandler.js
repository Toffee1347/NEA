import sqlite from 'better-sqlite3';

const db = sqlite('./data/main.db');

db.prepare('CREATE TABLE IF NOT EXISTS accounts (username STRING, password STRING, topScore INT)').run();
const add = db.prepare('INSERT INTO accounts (username, password, topScore) VALUES (@username, @password, 0)');
const text = db.prepare("SELECT topScore FROM accounts WHERE username = '@username' AND password = '@password'")

export function addAccount(options) {
    add.run(options);
};
export function checkAccount(options) {
    return text.run(options);
};