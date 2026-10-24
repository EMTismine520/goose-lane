"""Resize/encode generated masters, preserving their alpha without creative edits."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'art/home-cooking'
entries = json.loads((ART / 'generated-sources.json').read_text(encoding='utf-8'))
manifest_path = ROOT / 'public/assets/manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
devices = {'beast-meat-cart', 'poultry-cart', 'spice-box', 'home-cooking-pot'}
sheet = Image.new('RGB', (720, ((len(entries) + 5) // 6) * 120), '#fff1d6')
draw = ImageDraw.Draw(sheet)
total = 0
for i, entry in enumerate(entries):
    asset = entry['id']
    master = ART / 'masters' / (asset + '.png')
    master.parent.mkdir(parents=True, exist_ok=True)
    source = Path(entry['source'])
    if not source.is_absolute():
        source = ART / source
    if not source.exists():
        source = master
    image = Image.open(source).convert('RGBA')
    if image.getextrema()[3][0] == 255:
        raise ValueError(f'{asset}: generated source has no transparent pixels')
    image.resize((512, 512), Image.Resampling.LANCZOS).save(master, optimize=True)
    folder = 'entities' if asset in devices else 'items'
    relative = f'assets/{folder}/{asset}.webp'
    target = ROOT / 'public' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    image.resize((256, 256), Image.Resampling.LANCZOS).save(target, quality=86, method=6)
    total += target.stat().st_size
    manifest = [row for row in manifest if row['assetId'] != asset]
    manifest.append({'assetId': asset, 'frame': relative, 'pivot': [0.5, 0.5], 'scale': 0.9,
                     'source': 'Original ImageGen hand-painted artwork · Goose Lane 2026'})
    x, y = (i % 6) * 120, (i // 6) * 120
    preview = image.resize((86, 86), Image.Resampling.LANCZOS)
    sheet.paste(preview, (x + 17, y + 3), preview)
    draw.text((x + 3, y + 94), asset.replace('dish-fresh-home-', '')[:22], fill='#725037')
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
sheet.save(ART / 'contact-sheet.png')
print(json.dumps({'assets': len(entries), 'runtimeBytes': total, 'alphaVerified': True}))
