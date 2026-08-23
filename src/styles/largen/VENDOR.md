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

Retrieved 2026-08-23 from the pinned, immutable 0.2.0 paths:

| File | Source | sha256 |
|---|---|---|
| `largen.css` | `https://largen.exe.xyz/v/0.2.0/largen.css` | `dd53e06596e584bd294e59b98a7dc5bc9f1df642247ffeab9c19c3ea8eb41cf9` |
| `theme-dark.css` | `https://largen.exe.xyz/v/0.2.0/theme-dark.css` | `869518e75aabe57b2fea1a29e0232df1b4f6a4749d309f0cca8d0368588502e1` |
| `reference.css` | `https://largen.exe.xyz/v/0.2.0/largen.components.css` | `ae1e32f6c071777d8e6448e25197812530e9980c53c035de0db254d6c414fd38` |

Verify with:

```sh
shasum -a 256 largen.css theme-dark.css reference.css
```

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
