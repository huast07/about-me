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

## Travels and season notes

The travel atlas uses D3 7.9.0 and topojson-client 3.1.0 (ISC licenses),
and Natural Earth country boundaries through world-atlas 2.0.2 (public domain).
Routes are illustrative great-circle connections from Toronto, not a record of flights.
Add country photographs to `js/travel-content.js` as documented there. The travel
notes box is a placeholder until Sterling supplies the text.

The Travels soundtrack is Handel's *Water Music*, Sarabande, performed by the
Marine Chamber Orchestra of the United States Marine Band, conducted by Michelle
Rakers. [Recording and public-domain details](https://commons.wikimedia.org/wiki/File:Handel%27s_Water_Music_-_16._Sarabande_-_Chamber_Orchestra_-_United_States_Marine_Band.opus).
The playback loop crossfades the recording. The cherry photograph is by
[Sciencia58, CC0](https://commons.wikimedia.org/wiki/File:Blossoms_of_Prunus_serrulata.jpg).
Season panels link to their scientific and literary sources.

## Subpage artwork

- Travels: Caspar David Friedrich, *Wanderer above the Sea of Fog*, c. 1818.
  [Public-domain source](https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg); local file `assets/art/travel-romanticism.jpg`.
- Industry: Robert Delaunay, *Hommage à Blériot*, 1914.
  [Public-domain source](https://commons.wikimedia.org/wiki/File:Robert_Delaunay,_Hommage_à_Blériot,_1914.jpg); local file `assets/art/industry-modernism.jpg`.
- Research: Claude Monet, *Water Lilies*, 1906.
  [Public-domain source](https://commons.wikimedia.org/wiki/File:Claude_Monet_-_Water_Lilies_-_1933.1157_-_Art_Institute_of_Chicago.jpg); local file `assets/art/research-impressionism.jpg`.
- Readings and Hobbies: restored Minoan dolphin fresco from Knossos.
  Photograph by [Armagnac-commons](https://commons.wikimedia.org/wiki/File:Dauphins_de_knossos.jpg),
  [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/); local file `assets/art/readings-minoan.jpg`.
  Images are fitted to the viewport and displayed beneath a CSS colour wash.

### Military artwork

Original AI-generated surrealist remembrance painting, created with the built-in
image-generation tool; local file `assets/art/military-remembrance.png`.

Generation prompt: landscape surrealist oil painting about remembrance; red poppies,
weathered empty stone memorials receding toward a misty sea, shadows becoming ship
silhouettes, and a floating stone arch framing a pale dawn sky. Reflective mood,
muted blue-grey and limestone with crimson accents, quiet central space for text;
no combat, weapons, lettering, or flags. Created with the built-in image tool.

Artwork edit (built-in image tool): remove all tombstones and their plinths, filling
the exposed areas with poppy meadow, rocks, hillside and mist; preserve the floating
arches, ships, dawn light, composition and oil-painting style.
