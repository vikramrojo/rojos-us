# largen 0.2.0 — vendored

Do not edit anything in this directory. It is upstream, byte for byte.

Customisation belongs in `../site-theme.css` (token overrides) or
`../components/*.css` (our own components). Both load after these files and
win by ordinary cascade rules, so nothing here ever needs patching.


## Why vendored rather than a dependency

largen is not installable. `npm view largen` returns 404 and the `largen.dev`
host in its docs does not resolve, so `npm install largen`, the CDN `<link>`
and `npx largen verify` are all unavailable. Its own documentation endorses
this anyway:

> Optional, and copy-in rather than imported — largen ships an algebra, not a
> dependency, so take the source and it is yours to edit.

The contract check that `npx largen verify` would have run is instead the
`check_component_css` tool on the largen MCP server (see `.mcp.json`).

## Source

Retrieved 2026-08-23 from the ROOT paths, not the pinned ones.

    version 0.2.0   build b9fc348c

| File | Source | bytes | sha256 |
|---|---|---:|---|
| `largen.css` | `/largen.css` | 9301 | `e733f3ff799848c4b1da6ac0a207db27327cbb8fc59d6a78cb321b25f1d8dc74` |
| `theme-dark.css` | `/theme-dark.css` | 845 | `2976187639e0743b8e7cbebc209237586ec6170cf9b1f9ed4f670ec7284cc352` |
| `reference.css` | `/largen.components.css` | 8255 | `10f813c1c4048d485ba5e0597b6b9bab80b92594bd64f2a0428d3cf3440bdbd5` |

`build.json` is vendored alongside, so the digests above are copied from what
upstream publishes rather than computed by hand. Verify with:

```sh
python3 - <<'EOF'
import json, hashlib, pathlib
d = pathlib.Path('src/styles/largen')
m = json.load(open(d / 'build.json'))
for name, local in [('largen.css','largen.css'),
                    ('largen.components.css','reference.css'),
                    ('theme-dark.css','theme-dark.css')]:
    got = hashlib.sha256((d / local).read_bytes()).hexdigest()
    print(('ok   ' if got == m['files'][name]['sha256'] else 'DRIFT'), local)
EOF
```

**Pin by hash, not by version.** `/largen.css` and `/v/0.2.0/` both report 0.2.0
and serve different bytes; the ambiguity is known and deliberate upstream. The
`build` id names a build but is not the file digest — it is the hash of the
bundle before the banner was added. `curl -sI` answers "has it moved?" via ETag
without downloading, and `integrity` strings in `build.json` work as SRI now
that CORS is served.

`contract.txt` is the authoring contract at this build (`/llms-compact.txt`),
vendored so the docs cannot drift from the code without it showing in a diff.

## What each file is

- **`largen.css`** — the library. Seven layers (`reset`, `tokens`, `paint`,
  `tone`, `elements`, `components`, `modifiers`), thirteen `@property`
  registrations, and the layout utilities `.stack .row .cluster .center .grid
  .switcher .sidebar` plus `[data-align]` / `[data-justify]`. Light tokens only.
- **`theme-dark.css`** — the `[data-theme=dark]` token overrides. Nothing else.
- **`reference.css`** — largen's 32 optional reference components.
  **Never imported.** It is here to be read and copied out of. Importing it
  would ship 32 components this site does not use.

## Updating

Re-fetch the next pinned version into a scratch directory, diff against these,
then replace and update the table above. Because nothing here is edited, a
diff is always a clean upstream diff.
