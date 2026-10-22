"""Check actual rendered icon pixels from the simulator's renderChecks.js run."""
from pathlib import Path
from collections import Counter
import json
import sys
from PIL import Image

folder = Path(sys.argv[1])
stages = json.loads((folder / 'complete.json').read_text())['stages']
selected = [0, 1]
checks = []
for stage in stages:
    if stage.get('select'):
        selected = [2, 0]
    for control in range(2):
        image = Image.open(folder / f"{stage['name']}-{control}.png").convert('RGBA')
        for segment in range(3):
            color = (stage['active'] or stage['normal']) if segment == selected[control] else stage['normal']
            band = image.crop((0, segment * image.height // 3, image.width, (segment + 1) * image.height // 3))
            pixels = Counter(band.getdata())
            if color:
                rgb = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5))
                count = sum(n for rgba, n in pixels.items() if rgba[:3] == rgb and rgba[3] > 200)
                assert count > 25, (stage['name'], control, segment, color, count)
                checks.append(dict(stage=stage['name'], control=control, segment=segment, color=color, matchingPixels=count))
            else:
                for rgb in [(255, 102, 0), (0, 122, 255), (142, 68, 173), (0, 128, 64)]:
                    count = sum(n for rgba, n in pixels.items() if rgba[:3] == rgb and rgba[3] > 200)
                    assert count == 0, (stage['name'], control, segment, rgb, count)
                checks.append(dict(stage=stage['name'], control=control, segment=segment, color='system', oldPalettePixels=0))
(folder / 'pixel-checks.json').write_text(json.dumps(checks, indent=2) + '\n')
print(f'PASS: {len(checks)} rendered icon checks across 14 snapshots and both styles')
