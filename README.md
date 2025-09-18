# 🎶 YouTube Kannada Songs Player

A simple web-based music player that plays songs directly from a **YouTube playlist** using the **YouTube IFrame API**.  
Built with **HTML, CSS, and JavaScript**.

---

## 📂 Project Structure
youtube_playlist_player/
│── index.html # Main webpage
│── style.css # Styling
│── script.js # Player logic (update playlist ID / API key here)

---

## 🚀 How to Run
1. Download or clone the project.
2. Open `index.html` in your browser.  
   *(For best results, run a simple local server: `python -m http.server 8000` or `npx serve`.)*
3. By default, it will load the demo Kannada playlist.

---

## 🎯 Using Your Own Playlist
1. Copy your YouTube playlist link. Example:  
https://www.youtube.com/playlist?list=PL7A9n1TybRSmp7udNvwK0ldngp5ngAUDh

2. Extract the playlist ID (the part after `list=`). Example:  
PL7A9n1TybRSmp7udNvwK0ldngp5ngAUDh

3. Open `script.js` and replace:
```js
const PLAYLIST_ID = 'PL7A9n1TybRSmp7udNvwK0ldngp5ngAUDh';
🔑 (Optional) Add a YouTube Data API Key
Without an API key, you can still play songs, but titles and thumbnails may not load correctly.

To enable full metadata:

Get a YouTube Data API v3 key from Google Cloud Console.

Open script.js and set:

const API_KEY = 'YOUR_API_KEY_HERE';
🎵 Example Kannada Playlists
Trending Kannada Songs Jukebox
Playlist ID: PL7A9n1TybRSmp7udNvwK0ldngp5ngAUDh

Hits Video | Kannada Songs (Official)
Playlist ID: PLcMFVt1CLvwKW380EOf6V1N09cQZo1hKp

🕹 Features
Play / Pause / Next / Previous

Shuffle & Loop modes

Playlist display with clickable tracks

Shows current song title & thumbnail (if API key is set)

Volume & progress control

⚠️ Notes
Do not share your API key publicly.

Works best when hosted on a local or live server.

Requires internet connection (YouTube embed).

