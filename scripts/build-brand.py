"""Create web/app derivatives of the supplied emblem; preserve its original pixels."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import hashlib

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
image = Image.open(source).convert('RGB')
print('Original SHA256:', hashlib.sha256(source.read_bytes()).hexdigest())
print('Original dimensions:', image.size)

web = image.copy()
web.thumbnail((780, 920), Image.Resampling.LANCZOS)
web.save(brand / 'dang-emblem.webp', quality=90, method=6)
# The app icon uses the portrait, keeping the detailed DANG lettering in the full emblem.
w, h = image.size
side = min(w, round(h * .76))
portrait = image.crop(((w-side)//2, 0, (w+side)//2, side))
for size in [32, 180, 192, 512]:
    icon = ImageOps.fit(portrait, (size, size), method=Image.Resampling.LANCZOS)
    icon.save(brand / f'icon-{size}.png', optimize=True)
mask = Image.new('RGB', (512, 512), '#000000')
mask.paste(ImageOps.fit(portrait, (360, 360), method=Image.Resampling.LANCZOS), (76, 76))
mask.save(brand / 'icon-maskable-512.png', optimize=True)
social = Image.new('RGB', (1200, 630), '#000000')
social_image = image.copy(); social_image.thumbnail((1080, 584), Image.Resampling.LANCZOS)
social.paste(social_image, ((1200-social_image.width)//2, (630-social_image.height)//2))
draw = ImageDraw.Draw(social)
draw.line((80, 70, 80, 560), fill='#b59662', width=2)
draw.line((1120, 70, 1120, 560), fill='#b59662', width=2)
social.save(brand / 'social-card.png', optimize=True)
