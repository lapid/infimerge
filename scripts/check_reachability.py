#!/usr/bin/env python3
"""
Check if elements are reachable from the 4 starting elements.
Usage:
  python scripts/check_reachability.py             # show all unreachable elements
  python scripts/check_reachability.py human       # check a specific element
  python scripts/check_reachability.py human fire  # check multiple
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
ELEMENTS_FILE = ROOT / "src/data/elements.json"
COMBOS_FILE = ROOT / "src/data/combinations.json"

STARTING = {"water", "fire", "earth", "air"}


def load_data():
    with open(ELEMENTS_FILE) as f:
        elements = {e["id"]: e for e in json.load(f)}
    with open(COMBOS_FILE) as f:
        combos = json.load(f)
    return elements, combos


def get_outputs(combo):
    if "output" in combo:
        return [combo["output"]]
    return combo.get("outputs", [])


def build_reachable(combos):
    reachable = set(STARTING)
    changed = True
    while changed:
        changed = False
        for combo in combos:
            a, b = combo["inputs"]
            if a in reachable and b in reachable:
                for out in get_outputs(combo):
                    if out not in reachable:
                        reachable.add(out)
                        changed = True
    return reachable


def find_path(target, combos, elements):
    """BFS to find shortest recipe path back to starting elements."""
    if target in STARTING:
        return [f"{target} (starting element)"]

    # Map output -> list of (inputA, inputB) pairs
    recipes = {}
    for combo in combos:
        a, b = combo["inputs"]
        for out in get_outputs(combo):
            recipes.setdefault(out, []).append((a, b))

    # BFS over element sets reachable at each step
    # State: frozenset of elements needed, path taken
    from collections import deque
    queue = deque()
    queue.append((target, []))
    visited = set()

    def resolve(elem, path, depth=0):
        if depth > 20:
            return None
        if elem in STARTING:
            return path + [f"{elem} ✓"]
        if elem not in recipes:
            return None
        a, b = recipes[elem][0]
        name = elements.get(elem, {}).get("name", elem)
        step = f"{elements.get(a,{}).get('name',a)} + {elements.get(b,{}).get('name',b)} → {name}"
        path_a = resolve(a, [], depth + 1)
        path_b = resolve(b, [], depth + 1)
        if path_a is None or path_b is None:
            return None
        return path_a + path_b + path + [step]

    result = resolve(target, [])
    return result


def main():
    elements, combos = load_data()
    reachable = build_reachable(combos)

    targets = sys.argv[1:] if len(sys.argv) > 1 else []

    if targets:
        for target in targets:
            if target not in elements:
                print(f"  ✗ '{target}' not found in elements.json")
                continue
            name = elements[target]["name"]
            if target in reachable:
                print(f"  ✓ {name} is reachable")
                path = find_path(target, combos, elements)
                if path:
                    print("    Path:")
                    seen = []
                    for step in path:
                        if step not in seen:
                            seen.append(step)
                            print(f"      {step}")
            else:
                print(f"  ✗ {name} is NOT reachable from starting elements")
    else:
        # Report all unreachable elements
        unreachable = [
            e for eid, e in elements.items()
            if eid not in reachable and not e.get("isStarting")
        ]
        if not unreachable:
            print(f"All {len(elements)} elements are reachable!")
        else:
            print(f"{len(unreachable)} unreachable elements (out of {len(elements)}):\n")
            by_tier = {}
            for e in unreachable:
                by_tier.setdefault(e["tier"], []).append(e)
            for tier in sorted(by_tier):
                print(f"  Tier {tier}:")
                for e in by_tier[tier]:
                    print(f"    - {e['name']} ({e['id']})")

        print(f"\nReachable: {len(reachable)} / {len(elements)}")


if __name__ == "__main__":
    main()
