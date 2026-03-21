#!/usr/bin/env python3
"""
Generate element icons using the Gemini image generation API.

Usage:
  # Generate icons for specific elements:
  python scripts/generate_icons.py water fire earth air steam lava

  # Generate for ALL elements (slow — ~474 calls):
  python scripts/generate_icons.py --all

  # Generate for a tier:
  python scripts/generate_icons.py --tier 0

  # Skip already-generated icons (default: True):
  python scripts/generate_icons.py --all --overwrite

Requires:
  pip install google-genai Pillow
  export GEMINI_API_KEY=your_key_here

Icons are saved to: public/icons/{element_id}.png (64x64 px)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Missing dependency. Run:  pip install google-genai")
    sys.exit(1)

try:
    from PIL import Image
    import io
except ImportError:
    print("Missing dependency. Run:  pip install Pillow")
    sys.exit(1)

# ── Paths ──────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
ROOT = SCRIPT_DIR.parent
ELEMENTS_FILE = ROOT / "src" / "data" / "elements.json"
ICONS_DIR = ROOT / "public" / "icons"
ICONS_DIR.mkdir(parents=True, exist_ok=True)

# ── Prompt template ────────────────────────────────────────────────────────
PROMPT_TEMPLATE = (
    "A single game icon for \"{description}\" in a dark fantasy puzzle game. "
    "Style: glowing fantasy RPG inventory icon, centered on a SOLID BLACK background (#0d1117). "
    "The icon uses the accent color {color}. "
    "No text, no label, no white background, no frame. Black background only. "
    "Crisp, symbolic, instantly recognizable. Square composition."
)

# Per-element description overrides to avoid ambiguity
DESCRIPTIONS = {
    "earth":        "a mound of brown dirt/soil (not the planet)",
    "air":          "a swirling gust of wind and blue air currents",
    "water":        "a glowing water droplet",
    "fire":         "a burning orange flame",
    "stone":        "a grey rock or stone",
    "coal":         "a chunk of black coal mineral",
    "carbon":       "carbon atoms / graphite mineral",
    "plant":        "a small green sprout plant",
    "life":         "a glowing green DNA helix representing life",
    "death":        "a skull or scythe representing death",
    "light":        "rays of golden light",
    "darkness":     "a swirling dark void",
    "cold":         "ice crystals / cold blue energy",
    "heat":         "red heat waves / thermal energy",
    "energy_concept": "crackling energy lightning bolt",
    "time":         "an hourglass with flowing sand",
    "soul":         "a glowing ethereal spirit orb",
    "planet":       "a ringed alien planet (not Earth)",
    "moon":         "a crescent moon",
    "sun":          "a radiant yellow sun",
    "star":         "a glowing five-pointed star",
    "void":         "an empty swirling dark void portal",
    "god":          "a divine radiant crown of light",
    "evolution":    "a DNA helix transforming / evolving",
    "cell":         "a biological cell under microscope",
    "virus":        "a spiky virus particle",
    "dna":          "a double-helix DNA strand",
    "atom":         "an atom with electron orbits",
    "chaos":        "a swirling multicolor vortex of chaos",
    "order":        "a perfect geometric grid pattern",
}

# ── Gemini setup ───────────────────────────────────────────────────────────
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)


def load_elements():
    with open(ELEMENTS_FILE) as f:
        return json.load(f)


def remove_light_background(img: "Image.Image", threshold: int = 200) -> "Image.Image":
    """
    Make near-white pixels transparent so icons look good on dark backgrounds.
    Pixels where R, G, B are all above `threshold` become transparent.
    """
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        if r > threshold and g > threshold and b > threshold:
            new_data.append((r, g, b, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    return img


def generate_icon(element: dict, size: int = 64) -> bool:
    """Generate and save an icon for one element. Returns True on success."""
    name = element["name"]
    color = element["color"]
    eid = element["id"]
    out_path = ICONS_DIR / f"{eid}.png"

    description = DESCRIPTIONS.get(eid, name)
    prompt = PROMPT_TEMPLATE.format(description=description, color=color)

    try:
        response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                output_mime_type="image/png",
            ),
        )

        if not response.generated_images:
            print(f"  ✗ No image returned for {name}")
            return False

        img_bytes = response.generated_images[0].image.image_bytes

        img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
        img = remove_light_background(img)
        img = img.resize((size, size), Image.LANCZOS)
        img.save(out_path, "PNG")
        print(f"  ✓ {name} → {out_path.name}")
        return True

    except Exception as e:
        print(f"  ✗ {name}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Generate element icons via Gemini")
    parser.add_argument("ids", nargs="*", help="Element IDs to generate (e.g. water fire)")
    parser.add_argument("--all", action="store_true", help="Generate for all elements")
    parser.add_argument("--tier", type=int, default=None, help="Generate for a specific tier (0-6)")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing icons")
    parser.add_argument("--size", type=int, default=64, help="Icon size in pixels (default: 64)")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay between API calls in seconds")
    args = parser.parse_args()

    elements = load_elements()
    elements_by_id = {e["id"]: e for e in elements}

    # Determine which elements to process
    if args.all:
        targets = elements
    elif args.tier is not None:
        targets = [e for e in elements if e["tier"] == args.tier]
    elif args.ids:
        targets = []
        for eid in args.ids:
            if eid not in elements_by_id:
                print(f"Warning: unknown element id '{eid}', skipping")
            else:
                targets.append(elements_by_id[eid])
    else:
        parser.print_help()
        print("\nExample: python scripts/generate_icons.py water fire earth air")
        sys.exit(0)

    # Filter already-generated unless --overwrite
    if not args.overwrite:
        before = len(targets)
        targets = [e for e in targets if not (ICONS_DIR / f"{e['id']}.png").exists()]
        skipped = before - len(targets)
        if skipped:
            print(f"Skipping {skipped} already-generated icon(s). Use --overwrite to redo them.")

    if not targets:
        print("Nothing to generate.")
        return

    print(f"\nGenerating {len(targets)} icon(s) at {args.size}×{args.size}px...\n")
    ok = fail = 0
    for i, el in enumerate(targets, 1):
        print(f"[{i}/{len(targets)}] {el['name']} ({el['id']})")
        if generate_icon(el, size=args.size):
            ok += 1
        else:
            fail += 1
        if i < len(targets):
            time.sleep(args.delay)

    print(f"\nDone — {ok} succeeded, {fail} failed.")
    print(f"Icons saved to: {ICONS_DIR}")


if __name__ == "__main__":
    main()
