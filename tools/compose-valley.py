"""Compose the background hanging scroll from public-domain Chinese paintings.

The scene (bottom to top, the order you scroll through it): a scholar under a pine on the near bank,
a fisherman's boat on the river, a bridge and a village, the river narrowing to a waterfall between
cliffs with a pavilion beside it, a temple pagoda on the shoulder of the main peak, far peaks, the moon
and a line of geese.

Each piece is cut from a real painting, turned into an ink layer (ink darkness -> alpha, silk removed)
and placed on one 1000 x 4000 unit scroll with feathered edges, so the brushwork is the masters' own.

Usage:  python3 tools/compose-valley.py <download-dir> assets/art/valley.webp
Sources are fetched from Wikimedia Commons into <download-dir> if missing (needs Pillow + numpy).
"""
import os
import sys
import time
import urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

VW, VH = 1000, 4000          # scroll size in layout units (same as the page's old procedural scroll)
PX = 1.2                     # output pixels per unit -> 1200 x 4800
INK = np.array([38, 35, 31], np.float32)
UA = "portfolio-site-builder/1.0 (static site build script)"

SOURCES = {  # all public domain (artists died centuries ago; faithful scans of 2D works)
    "fankuan": "Fan_Kuan_-_Travelers_Among_Mountains_and_Streams_-_Google_Art_Project.jpg",
    "licheng": "Li_Cheng_-_A_Solitary_Temple_Amid_Clearing_Peaks_-_Google_Art_Project.jpg",
    "guoxi": "Guo_Xi_-_Early_Spring_(large).jpg",
    "tangyin": "Tang_Yin_Whispering_Pines.jpg",
    "shenzhou": "Lofty_Mt.Lu_by_Shen_Zhou.jpg",
    "malin": "宋馬麟靜聽松風圖.jpg",
    "water": "Ma_Yuan_-_Water_Album_-_Ten_Thousand_Riplets_on_the_Yangzi.jpg",
    "angler": "Angler_on_a_Wintry_Lake,_by_Ma_Yuan,_1195.jpg",
}

# crop: fractions of the source (x0, y0, x1, y1); at: top-left in units (or by: bottom edge in units);
# w: width in units; tone: ink strength (far things paler); lo/span: ink threshold and range for that
# scan's silk; mist: how much of the piece's height dissolves at the bottom (and half that at the top).
PIECES = [
    # far peaks under the moon and geese (Guo Xi, Early Spring)
    dict(src="guoxi", crop=(.10, .08, .74, .44), at=(60, 380), w=880, tone=.42, lo=.20, span=.5, mist=.35),
    # the main peak with the temple pagoda on its shoulder (Li Cheng, A Solitary Temple Amid Clearing Peaks)
    dict(src="licheng", crop=(.0, .08, 1.0, .68), at=(0, 900), w=1000, tone=.6, lo=.22, span=.5, mist=.25),
    # the gorge: waterfall between cliffs (Shen Zhou, Lofty Mount Lu)
    dict(src="shenzhou", crop=(.0, .40, 1.0, .83), at=(0, 2040), w=1000, tone=.72, lo=.14, span=.55, mist=.18),
    # village by the water (Li Cheng)
    dict(src="licheng", crop=(.10, .74, .75, .90), at=(560, 3120), w=430, tone=.68, lo=.22, span=.5, mist=.3),
    "river",
    # the bridge with a scholar and his attendant, over cascades (Tang Yin, Whispering Pines on a Mountain Path)
    dict(src="tangyin", crop=(.0, .70, .75, .92), at=(0, 2780), w=760, tone=.85, lo=.12, span=.5, mist=.2, top=.3),
    # a fisherman on the river (Ma Yuan, Angler on a Wintry Lake)
    dict(src="angler", crop=(.26, .48, .66, .70), at=(720, 3700), w=220, tone=1, lo=.14, span=.45, mist=0),
    # the near bank: a scholar under a pine, listening to the wind (Ma Lin)
    dict(src="malin", crop=(.0, .52, .78, .96), by=4000, at=(-20, None), w=620, tone=.92, lo=.14, span=.45, mist=0, top=.3, median=3),
]
FEATHER = .16                # fraction of a piece's smaller side that fades out at its edges
# river centre line and width, bottom to top: [y, centre x, width] in units. It leaves the falls on
# the left and swings right toward the viewer.
RIVER = [(4000, 640, 820), (3780, 580, 540), (3560, 500, 330), (3330, 410, 210), (3100, 320, 120), (2880, 250, 60)]
WATER_CROP, WATER_TONE = (.22, .42, 1.0, 1.0), .5


def fetch(dl, key):
    path = os.path.join(dl, key + ".jpg")
    if not os.path.exists(path):
        url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.request.quote(SOURCES[key]) + "?width=1920"
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
        time.sleep(8)  # stay under Commons' rate limit
    return Image.open(path).convert("RGB")


def ink_alpha(im, lo, span, blur=.9, median=0):
    """Ink darkness relative to the local silk tone, as alpha in 0..1. Red seals are dropped.
    median removes a regular silk weave while keeping brush lines; blur softens finer grain."""
    if median:
        im = im.filter(ImageFilter.MedianFilter(median))
    a = np.asarray(im).astype(np.float32) / 255
    L = np.asarray(Image.fromarray((a @ np.array([.299, .587, .114], np.float32) * 255).astype(np.uint8))
                   .filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) / 255  # soften silk weave
    small = Image.fromarray((L * 255).astype(np.uint8)).resize((max(1, im.width // 16), max(1, im.height // 16)), Image.BILINEAR)
    bg = small.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(4)).resize(im.size, Image.BILINEAR)
    bg = np.maximum(np.asarray(bg).astype(np.float32) / 255, .15)
    alpha = np.clip((np.clip(1 - L / bg, 0, 1) - lo) / span, 0, 1) ** .9
    seal = (a[..., 0] - np.maximum(a[..., 1], a[..., 2])) > .16
    alpha[seal] = 0
    return alpha


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def feather_mask(h, w, f, mist, seed, top_fade=None):
    """Soft, irregular edges (no visible rectangle), with mist rising from the bottom."""
    rng = np.random.default_rng(seed)
    noise = Image.fromarray((rng.random((8, 8)) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    wobble = (np.asarray(noise).astype(np.float32) / 255 - .5) * .5           # -0.25..0.25
    k = max(2, min(h, w) * f)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    side = np.minimum(x, w - 1 - x) / k
    top = y / max(k, h * (mist * .5 if top_fade is None else top_fade))
    bottom = (h - 1 - y) / max(k, h * mist)
    return smooth(np.minimum(np.minimum(side, top), bottom) + wobble * (np.minimum(side, np.minimum(top, bottom)) < 1))


def over(canvas, layer, x, y):
    """Composite a single-channel alpha layer onto the canvas alpha at pixel (x, y)."""
    H, W = canvas.shape
    h, w = layer.shape
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return
    sub = layer[y0 - y:y1 - y, x0 - x:x1 - x]
    canvas[y0:y1, x0:x1] = sub + canvas[y0:y1, x0:x1] * (1 - sub)


def place(canvas, dl, p):
    im = fetch(dl, p["src"])
    W, H = im.size
    c = p["crop"]
    im = im.crop((int(c[0] * W), int(c[1] * H), int(c[2] * W), int(c[3] * H)))
    if p.get("flip"):
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    w = int(p["w"] * PX)
    h = int(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    mask = feather_mask(h, w, FEATHER, p.get("mist", 0), sum(map(ord, p["src"])), p.get("top"))
    layer = ink_alpha(im, p["lo"], p["span"], p.get("blur", .9), p.get("median", 0)) * p["tone"] * mask
    top = p["by"] * PX - h if "by" in p else p["at"][1] * PX
    over(canvas, layer, int(p["at"][0] * PX), int(top))


def river(canvas, dl):
    """Ma Yuan's ripples mapped into the river's shape, smaller and paler as it recedes."""
    tex = fetch(dl, "water")
    W, H = tex.size
    c = WATER_CROP
    tex = tex.crop((int(c[0] * W), int(c[1] * H), int(c[2] * W), int(c[3] * H)))
    # one pre-shrunk copy per ripple size, so receding water is filtered rather than dotted
    levels = {k: ink_alpha(tex.resize((int(tex.width * k), int(tex.height * k)), Image.LANCZOS), .07, .3, blur=0, median=3)
              for k in (1, .7, .5, .35, .25)}
    ys = np.array([r[0] for r in RIVER][::-1], np.float32)
    cxs = np.array([r[1] for r in RIVER][::-1], np.float32)
    wds = np.array([r[2] for r in RIVER][::-1], np.float32)
    top, bottom = int(ys[0] * PX), int(VH * PX)
    out_w = int(VW * PX)
    xs = np.arange(out_w) / PX
    v = 0.0
    for py in range(top, bottom):
        yu = py / PX
        cx, wd = np.interp(yu, ys, cxs), np.interp(yu, ys, wds)
        depth = (yu - ys[0]) / (VH - ys[0])            # 0 at the falls, 1 at the near bank
        scale = .25 + .75 * depth ** 1.3                # ripple size relative to the near bank
        k = min(levels, key=lambda q: abs(q - scale))
        tex_k = levels[k]
        th, tw = tex_k.shape
        v += k / scale / PX
        across = (xs - cx) / (wd / 2)                   # -1..1 across the river
        edge = np.clip((1 - np.abs(across)) / .35, 0, 1)
        row = tex_k[int(v * PX * .8) % th, ((xs - cx) * PX * k / scale).astype(int) % tw]
        layer = row * edge * WATER_TONE * (.45 + .55 * depth) * min(1, (yu - ys[0]) / 60)
        canvas[py] = layer + canvas[py] * (1 - layer)


def moon_and_geese(canvas):
    img = Image.new("L", canvas.shape[::-1], 0)
    d = ImageDraw.Draw(img)
    cx, cy, r = 800 * PX, 300 * PX, 55 * PX
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=95, width=int(2 * PX))
    for k in range(4):  # a skein of geese, each two brushed wing strokes
        gx, gy, s = (230 + k * 30) * PX, (470 + abs(k - 1.5) * 12) * PX, 9 * PX
        d.line([(gx - s, gy), (gx - s * .3, gy - s * .55), (gx, gy)], fill=150, width=int(1.6 * PX))
        d.line([(gx, gy), (gx + s * .4, gy - s * .6), (gx + s, gy - s * .1)], fill=150, width=int(1.6 * PX))
    layer = np.asarray(img.filter(ImageFilter.GaussianBlur(.8 * PX))).astype(np.float32) / 255
    over(canvas, layer, 0, 0)


def main(dl, out):
    os.makedirs(dl, exist_ok=True)
    canvas = np.zeros((int(VH * PX), int(VW * PX)), np.float32)
    moon_and_geese(canvas)
    for p in PIECES:
        river(canvas, dl) if p == "river" else place(canvas, dl, p)
    rgba = np.dstack([np.broadcast_to(INK, canvas.shape + (3,)), canvas[..., None] * 255]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(out, "WEBP", quality=72, alpha_quality=60, method=4)
    print(out, canvas.shape[::-1])


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
