import sqlite from 'better-sqlite3';

const db = sqlite('./data/main.db');

db.prepare('CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, username STRING, password STRING, topScore INT)').run();
export const addAccount = (options) => db.prepare(`INSERT INTO accounts (id, username, password, topScore) VALUES (NULL, @username, @password, ${Math.round(Math.random() * 100)})`).run(options);
export const testAcccountUsername = (options) => db.prepare("SELECT * FROM accounts WHERE username = @username").get(options);
export const allAccounts = () =>  db.prepare('SELECT topScore, username FROM accounts').all();


db.prepare('CREATE TABLE IF NOT EXISTS songs (id INTEGER PRIMARY KEY AUTOINCREMENT, name STRING, artist STRING)').run();
export const clearSongs = () => {
    db.prepare('DROP TABLE IF EXISTS songs').run();
    db.prepare('CREATE TABLE IF NOT EXISTS songs (id INTEGER PRIMARY KEY AUTOINCREMENT, name STRING, artist STRING)').run();
}
export const addSong = (options) => db.prepare('INSERT INTO songs (id, name, artist) VALUES (NULL, @song, @artist)').run(options);
export const getSong = (options) => db.prepare("SELECT * FROM songs WHERE id = @id").get(options);