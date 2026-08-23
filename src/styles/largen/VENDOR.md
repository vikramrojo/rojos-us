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

Retrieved 2026-08-23 from the ROOT paths, not the pinned ones:

| File | Source | sha256 |
|---|---|---|
| `largen.css` | `https://largen.exe.xyz/largen.css` | `7f04c4116cec78b6953670da7e453f7201f17bbea8b41bae6d3bc75d8be76f90` |
| `theme-dark.css` | `https://largen.exe.xyz/theme-dark.css` | `dba24735dc134257d4acd11acdf1de1b8704e80394724a26768b775939b5dee3` |
| `reference.css` | `https://largen.exe.xyz/largen.components.css` | `88cafb0c6f066437f72de3f2d957503684a502b95608c6123d69b87bbc4ba542` |

**The version string is not currently a stable identifier.** Both the root and
`/v/0.2.0/` call themselves 0.2.0 and serve different builds — the pinned path
still has the older one (8858 bytes, unlayered dark theme), the root has the
fixes (9071 bytes). Vendored from root deliberately, and the checksums above are
what actually pin this. Re-check them before assuming an update is a no-op.

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
