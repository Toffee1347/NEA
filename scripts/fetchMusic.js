import { addSong, clearSongs } from "./dbhandler.js";
import fetch from 'node-fetch';

export async function fetchMusic() {
    try {
        const songsList = [];

        for (let i = 0; i < 100; i += 20) {
            const songs = await (await fetch(`https://shazam.p.rapidapi.com/charts/track?locale=en-US&pageSize=20&startFrom=${i}`, {
                "method": "GET",
                "headers": {
                    "x-rapidapi-key": "b1e506106dmsh39a3e8882d6670fp1d96ddjsn95aa10e9b6c2",
                    "x-rapidapi-host": "shazam.p.rapidapi.com"
                }
            })).json();
            songs.tracks.forEach((song) => {
                songsList.push({
                    song: song.title,
                    artist: song.subtitle,
                });
            });
        }

        clearSongs();
        songsList.forEach((song) => {
            addSong(song);
        });
    } catch (err) {
        return false;
    }
    return true;
}