# Usage: python3 tools/ink-layer.py <scan.jpg> assets/art/<name>.webp  (needs Pillow + numpy)
"""Turn a scanned ink painting on silk into a transparent ink layer: ink darkness -> alpha, seals kept red."""
import sys
import numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float32) / 255
L = a @ np.array([0.299, 0.587, 0.114], np.float32)
# silk tone varies across the scroll: estimate it as a blurred local maximum of luminance
small = Image.fromarray((L * 255).astype(np.uint8)).resize((im.width // 8, im.height // 8), Image.BILINEAR)
bg = small.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6)).resize(im.size, Image.BILINEAR)
bg = np.maximum(np.asarray(bg).astype(np.float32) / 255, 0.2)
ink = np.clip(1 - L / bg, 0, 1)
alpha = np.clip((ink - 0.08) / 0.52, 0, 1) ** 0.85          # drop silk grain, keep washes
red = np.clip((a[..., 0] - np.maximum(a[..., 1], a[..., 2]) - 0.12) / 0.15, 0, 1)  # seal vermilion
INK, SEAL = np.array([42, 35, 36]), np.array([178, 52, 44])
rgb = INK * (1 - red[..., None]) + SEAL * red[..., None]
alpha = np.maximum(alpha, red * 0.9)
outim = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
outim.save(out, "WEBP", quality=70, alpha_quality=60, method=4)
print(outim.size)
