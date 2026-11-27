"""Import GymMane's pinned Dart catalog and artwork. Pass its checkout and Phosphor Core package paths."""
import json
import re
import sys
from pathlib import Path


def literal(token):
    return re.sub(r"\\(['\"\\$nrt])", lambda match: {
        "n": "\n", "r": "\r", "t": "\t",
    }.get(match[1], match[1]), token[1:-1])


def import_catalog(source):
    text = (source / "lib/catalog/exercise_catalog.dart").read_text()
    records = text.split("const List<Exercise> kExercises = [", 1)[1].split("\n];", 1)[0]
    lexer = re.compile(r"""\s+|//[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_][\w]*|[][(),:]""")
    tokens = []
    offset = 0
    while offset < len(records):
        match = lexer.match(records, offset)
        if not match:
            raise ValueError(f"Unexpected Dart near {records[offset:offset+80]!r}")
        token = match[0]
        if not token.isspace() and not token.startswith("//"):
            tokens.append(token)
        offset = match.end()
    values = iter(tokens)

    def expect(expected):
        actual = next(values)
        if actual != expected:
            raise ValueError(f"Expected {expected!r}, got {actual!r}")

    exercises = []
    for token in values:
        if token != "Exercise":
            raise ValueError(f"Expected Exercise, got {token!r}")
        expect("(")
        record = {}
        for field in values:
            if field == ")":
                break
            expect(":")
            value = next(values)
            if value == "[":
                items = []
                for item in values:
                    if item == "]":
                        break
                    if item != ",":
                        items.append(literal(item))
                record[field] = items
            else:
                record[field] = literal(value)
            expect(",")
        expect(",")
        exercises.append(record)

    def dictionary(name):
        block = text.split(f"{name} = {{", 1)[1].split("\n};", 1)[0]
        return dict(re.findall(r"'([^']+)': '([^']+)'", block))

    def ids(name):
        block = re.search(fr"{name} = [\[{{](.*?)[\]}}];", text, re.S)[1]
        return set(re.findall(r"'([^']+)'", block))

    modes = dictionary("kExerciseModes")
    sport_icons = dictionary("kSportIcons")
    stretches = ids("kStretchIds")
    cardio = ids("kCardioExtras")
    for exercise in exercises:
        key = exercise["id"]
        exercise["loggingMode"] = modes.get(key, exercise.get("mode", ""))
        if key in stretches:
            exercise["kind"] = "stretch"
        elif key in cardio:
            exercise["kind"] = "cardio"
        if key in sport_icons:
            exercise["icon"] = re.sub(r"[A-Z]", lambda match: "-" + match[0].lower(), sport_icons[key])
    assert len(exercises) == len({exercise["id"] for exercise in exercises})
    return exercises


def svg(frames):
    rules = ["path:not(:first-of-type){visibility:hidden}",
             "@media (prefers-reduced-motion: no-preference){"]
    for i in range(len(frames)):
        start, end = 100 * i / len(frames), 100 * (i + 1) / len(frames)
        keys = {"0%": "hidden", "100%": "hidden", f"{start:g}%": "visible", f"{end:g}%": "hidden"}
        rules.append(f"svg:not(:target) path:nth-of-type({i+1}){{animation:frame{i} 1.56s step-end infinite}}")
        rules.append(f"@keyframes frame{i}{{" + "".join(f"{key}{{visibility:{value}}}" for key, value in keys.items()) + "}")
    rules.append("}")
    lines = ['<svg xmlns="http://www.w3.org/2000/svg" id="still" viewBox="0 0 512 512" fill="#d9a184" fill-rule="evenodd">',
             f'  <style>{"".join(rules)}</style>']
    lines.extend(f'  <path d="{frame}" />' for frame in frames)
    return "\n".join([*lines, "</svg>", ""])


def main(source, phosphor):
    root = Path(__file__).resolve().parents[1]
    assets = root / "public/gymmane"
    (assets / "exercises").mkdir(parents=True, exist_ok=True)
    (assets / "icons").mkdir(exist_ok=True)
    catalog = import_catalog(source)
    art_slugs = {exercise["art"] for exercise in catalog if exercise["art"]}
    for path in (source / "assets/art").glob("*.txt"):
        frames = [line.strip() for line in path.read_text().splitlines() if line.strip()]
        assert frames and all(re.fullmatch(r"[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\-\s]+", line) for line in frames), path
        (assets / "exercises" / f"{path.stem}.svg").write_text(svg(frames))
    for icon in {exercise["icon"] for exercise in catalog if "icon" in exercise}:
        source_icon = phosphor / "assets/regular" / f"{icon}.svg"
        content = source_icon.read_text()
        content = content.replace('fill="currentColor"', 'fill="#d9a184"')
        (assets / "icons" / f"{icon}.svg").write_text(content)
    (assets / "PHOSPHOR-LICENSE.txt").write_text((phosphor / "LICENSE").read_text())
    missing = art_slugs - {p.stem for p in (assets / "exercises").glob("*.svg")}
    if missing:
        raise ValueError(f"Missing referenced artwork: {sorted(missing)}")
    (root / "src/lib/leveluplife/exercises/gymmaneCatalog.json").write_text(
        json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    print(f"Imported {len(catalog)} entries, {len(art_slugs)} referenced illustrations, "
          f"and {sum('icon' in exercise for exercise in catalog)} sport icon assignments.")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
