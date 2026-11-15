# about-me (In Progress)

(https://huast07.github.io/about-me/)

## Credits

The background scroll is a collage of public-domain paintings, composed by `tools/compose-valley.py`:
Ma Lin (Listening to the Wind in the Pines), Ma Yuan (Angler on a Wintry Lake; Water Album), Tang Yin (Whispering Pines on a Mountain Path),
Shen Zhou (Lofty Mount Lu), Li Cheng (A Solitary Temple Amid Clearing Peaks) and Guo Xi (Early Spring), via Wikimedia Commons.

## Soundtrack

The site plays **Antonio Vivaldi — The Four Seasons, Winter (RV 297), II. Largo**:
John Harrison (violin), Robert Turizziani (conductor), Wichita State University Chamber Players,
recorded February 6, 2000. Recording copyright John Harrison, used under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
[Source and original recording](https://commons.wikimedia.org/wiki/File:11_-_Vivaldi_Winter_mvt_2_Largo_-_John_Harrison_violin.ogg).
The locally hosted `assets/audio/winter-largo.mp3` is Wikimedia's MP3 transcode.
Playback applies a two-second end/start crossfade; this audio adaptation is also CC BY-SA 4.0.

Select **Play music** on any page. The recording downloads only on request (~3.4 MB),
fades in/out, and loops using Web Audio's audio clock. Pause freezes its position.
`js/navigation.js` preserves the player and tree while changing internal pages and
supports Back/Forward. Direct visits and refreshes remain ordinary static pages;
a new document requires a fresh Play click. Without JavaScript, links still work.
Serve over HTTP (for example `python3 -m http.server 4173`); seamless navigation
is unavailable when opening HTML files directly from disk.

Browser regression check (requires Playwright and its Chromium browser):
`node tests/music-navigation.cjs`. Set `PORTFOLIO_URL` to test a different local
server; `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` optionally select existing installations.
