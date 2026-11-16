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

Vivaldi plays across every page, including Travels.
Scientific and literary source references are retained in `js/tree.js`.

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

## Seasonal photograph credits

- Spring photograph: [些細な日常 · CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Cherry-blossom-buds.jpg).
- Summer photograph: [Famartin · CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:2020-07-20_11_20_58_Leaves_in_mid-summer_on_a_Kanzan_Cherry_along_Tranquility_Court_in_the_Franklin_Farm_section_of_Oak_Hill,_Fairfax_County,_Virginia.jpg).
- Autumn photograph: [Lesekreis · CC0](https://commons.wikimedia.org/wiki/File:Herbstlaub_der_Zierkirsche.JPG).
- Winter photograph: [Architect of the Capitol · public domain](https://commons.wikimedia.org/wiki/File:Japanese_Cherry_Trees_on_Capitol_Grounds_in_Winter_(16633259844).jpg).

CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/.
Photographs are displayed cropped to fit the popup.

Full Bloom artwork: original AI-generated Chinese ink-and-wash scholar scene,
`assets/art/full-bloom-scholar.png`, created with the built-in image tool.
Prompt: a contemplative scholar beneath flowering cherry branches beside a misty
stream, traditional literati brushwork on rice paper, restrained mineral washes,
wide composition with the scholar visible in a shallow crop; no lettering.

## Book covers

Reading-list cover images are served locally from `assets/books/`, sourced from
[Open Library Covers](https://openlibrary.org/dev/docs/api/covers) by ISBN.
Cover artwork belongs to the respective publishers and artists. Editions pictured
identify the books and do not imply a particular edition owned by Sterling.

- Manufacturing Consent: https://covers.openlibrary.org/b/isbn/9780375714498-L.jpg
- Talking to Strangers: https://covers.openlibrary.org/b/isbn/9780316478526-L.jpg
- Catch-22: https://covers.openlibrary.org/b/isbn/9781451626650-L.jpg
- Eichmann in Jerusalem: A Report on the Banality of Evil: https://covers.openlibrary.org/b/isbn/9780143039884-L.jpg
- Seeing Like a State: https://covers.openlibrary.org/b/isbn/9780300078152-L.jpg
- From Third World to First: The Singapore Story: https://covers.openlibrary.org/b/isbn/9780060197766-L.jpg
- History of the World: https://covers.openlibrary.org/b/isbn/9780195210439-L.jpg
- The Worldly Philosophers: https://covers.openlibrary.org/b/isbn/9780684862149-L.jpg
- The Story of Philosophy: https://covers.openlibrary.org/b/isbn/9780671739164-L.jpg
- The Elements of Colour: https://covers.openlibrary.org/b/isbn/9780471289296-L.jpg
- Steve Jobs: https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg

## Volunteering photo galleries

The volunteering page includes 36 supplied photographs: nine City of Toronto,
seven FIFA, and twenty Wind Whistle Farm photos. Web-sized JPEGs (up to 1800px)
and 480px thumbnails live in `assets/volunteering/`; originals remain untouched.
Exports have orientation applied and omit EXIF metadata.

Each album is listed in `volunteering.html` with descriptive captions and alt text.
`js/volunteering.js` opens the gallery on direct and progressive visits. Use the
previous/next buttons or arrow keys to browse, and Escape to close.
