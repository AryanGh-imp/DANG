"""Create web/app derivatives of the supplied emblem; preserve its original pixels."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageChops, ImageStat
import hashlib
import math

root = Path(__file__).resolve().parents[1]
original = root / 'Ancient Warrior Engraving Emblem.png'
brand = root / 'assets' / 'branding'
source = brand / 'dang-emblem.png'
assert original.resolve().parent == root and source.resolve().is_relative_to(root)
brand.mkdir(parents=True, exist_ok=True)
if original.exists():
    if source.exists():
        raise FileExistsError('Refusing to overwrite the preserved source image')
    original.rename(source)
image = Image.open(source)
image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
print('Original SHA256:', hashlib.sha256(source.read_bytes()).hexdigest())
print('Original dimensions:', image.size)

before = {path.name: path.stat().st_size for path in brand.iterdir() if path.is_file()}
for size, filename in [(180, 'dang-emblem-180.webp'), (360, 'dang-emblem-360.webp'), (540, 'dang-emblem.webp')]:
    web = image.copy()
    web.thumbnail((size, round(size * image.height / image.width)), Image.Resampling.LANCZOS)
    web.save(brand / filename, quality=88, method=6)

def save_png(image, path):
    # A 256-color palette keeps the engraving's detail while avoiding three
    # full RGB channels in installation icons. RGBA uses an alpha-aware palette.
    method = Image.Quantize.FASTOCTREE if image.mode == 'RGBA' else Image.Quantize.MEDIANCUT
    optimized = image.quantize(colors=256, method=method, dither=Image.Dither.NONE)
    optimized.save(path, optimize=True, compress_level=9)
    error = ImageStat.Stat(ImageChops.difference(image.convert('RGB'), optimized.convert('RGB')))
    mse = sum(value * value for value in error.rms) / 3
    print(path.name, 'RGB PSNR:', round(10 * math.log10(255 * 255 / mse), 2) if mse else 'lossless')
# The app icon uses the portrait, keeping the detailed DANG lettering in the full emblem.
w, h = image.size
side = min(w, round(h * .76))
portrait = image.crop(((w-side)//2, 0, (w+side)//2, side))
for size in [32, 180, 192, 512]:
    icon = ImageOps.fit(portrait, (size, size), method=Image.Resampling.LANCZOS)
    save_png(icon, brand / f'icon-{size}.png')
for size in [64, 128, 192]:
    ImageOps.fit(portrait, (size, size), method=Image.Resampling.LANCZOS).save(brand / f'brand-{size}.webp', quality=88, method=6)
mask = Image.new('RGB', (512, 512), '#000000')
mask_portrait = ImageOps.fit(portrait, (360, 360), method=Image.Resampling.LANCZOS)
mask.paste(mask_portrait, (76, 76), mask_portrait.getchannel('A') if mask_portrait.mode == 'RGBA' else None)
save_png(mask, brand / 'icon-maskable-512.png')
social = Image.new('RGB', (1200, 630), '#000000')
social_image = image.copy(); social_image.thumbnail((1080, 584), Image.Resampling.LANCZOS)
social.paste(social_image, ((1200-social_image.width)//2, (630-social_image.height)//2), social_image.getchannel('A') if social_image.mode == 'RGBA' else None)
draw = ImageDraw.Draw(social)
draw.line((80, 70, 80, 560), fill='#b59662', width=2)
draw.line((1120, 70, 1120, 560), fill='#b59662', width=2)
save_png(social, brand / 'social-card.png')
for path in sorted(brand.iterdir()):
    if path.is_file() and path.name != source.name:
        print(path.name, 'bytes:', before.get(path.name, 'new'), '->', path.stat().st_size)
