---
title: The token cost of abstraction
description: I moved this site off Tailwind and daisyUI onto largen, a property algebra for CSS. The measurements are interesting. What they imply about writing code an LLM has to read is more interesting.
date: 2026-08-23
tags: ['css', 'ai', 'engineering']
authors: ['vikram']
draft: true
---

> Skeleton. Data is final and measured; prose is placeholder.

## The setup

- This site: Astro 6, Tailwind v4, daisyUI v5, shadcn/radix component layer.
- Moved to [largen](https://largen.exe.xyz) — "a property algebra for CSS." Plain CSS, no build step, no plugin.
- 15 commits, verified page-by-page against the old build.

## What largen claims

- Twelve custom-property slots. Four axes: tone, variant, size, state. One universal paint rule.
- Everything above the component line is already solved — so a component is about six lines, and never mentions the tones, sizes, states or themes it supports.
- You don't configure pre-built components. You write the components; the algebra supplies the rest.

## What it measured out to

Same content, same 14 pages, both builds.

| | Tailwind + daisyUI | largen | |
|---|---:|---:|---:|
| CSS, raw | 112,697 | 53,033 | −53% |
| CSS, gzip | 18,643 | 11,008 | −41% |
| `class=` bytes in HTML | 98,344 | 12,404 | **−87%** |
| class tokens | 6,881 | 1,391 | **−80%** |
| tokens per element | 6.13 | 1.59 | −74% |
| style rules the engine holds | 1,035 | 530 | −49% |
| selectors per element | 1.81 | 1.06 | −41% |
| app JS (excl. pdf.js) | 259,537 | 205,350 | −21% |
| JS files | 12 | 5 | −58% |

- Four `client:load` React boundaries gone from blog posts. Those pages now ship no JS.
- Honest caveat: **no trustworthy wall-clock numbers.** Headless timing was unreliable; I discarded four attempts rather than report noise. Everything above is an *input* to performance — bytes parsed, rules held, selectors matched. Expect this to be smaller, not visibly faster to paint.

## The word "token" is doing two jobs

- Tailwind calls them utility tokens. LLMs call them context tokens. Here they're the same tokens.
- 6.13 → 1.59 per element. Every agent read of every component paid the old number.
- Utility CSS colocates styling decisions *in the markup*. That's the feature. It's also why reading a component costs you the whole design decision every time.
- Idea to develop: a codebase now has a **read cost**, not just a maintenance cost, and they're not the same metric.

## Generation got cheap; comprehension didn't

- The classic case for utilities: no naming, no indirection, trivial to delete. The cost was repetition — and repetition was a *writing* problem.
- LLMs are outstanding at repetition. That cost collapsed to near zero.
- So the economics invert. Optimise for information per token *read*, not friction per token *written*.
- Corollary: abstractions that were "not worth the indirection" when a human typed everything may be worth it when a model reads everything.

## An algebra is a compression scheme

- largen ships `/llms-compact.txt` — the whole contract in ~2,400 tokens. That's not a nicety, that's the product.
- Load 2,400 tokens once; every component afterwards is six lines.
- Compare: to correctly extend a `cva` variant matrix you need the entire matrix in context first. To extend largen you need the axes, which you already have.
- Idea: **the unit of abstraction is now "what must be resident in context to make a correct change."**

## Where the algebra actually paid

- The callout: 24 markdown admonition variants, each carrying two hardcoded Tailwind colour strings. 48 colour decisions.
- After: 24 lines, each setting `--tone`. Border, label colour, and both themes fall out of the axis.
- This is the claim working exactly as advertised.

## Where it didn't fit

- **Buttons aren't tonal.** This site's buttons are a *surface* treatment — hairline over canvas. Routing that through a tone-derived variant axis tints the label. Wrote plain classes instead.
- **Fixed-height controls.** `--scale` moves type and padding together; the source design shrinks the box while holding type at 14px. No multiplier reconciles those.
- **No leading slot.** The paint rule covers twelve properties; `line-height` isn't one. Set `--font-size` without it and the component silently grows. This caught me four separate times.
- Idea: an algebra is a claim about which things are the same. It pays where the claim holds and taxes you where it doesn't.

## The failures were never in the algebra

Worth the most words. Every bug that cost me real time was a *cascade* problem, not a contract problem:

- CSS sublayers inherit their parent's position. `site.base` and `site.overrides` could never straddle `largen.*`, so a global `* { --weight }` silently outranked the component that set it. An explicit `--weight: 900` computed as 300.
- Tailwind's preflight sorts last by default, which flattens every heading, list and border in a component authored below it. Layer order beats specificity, so no selector weight recovers it.
- largen shipped its light tokens layered and its dark theme unlayered — so dark-mode overrides were silently ignored while light ones applied. 99.6% of pixels differed and the CSS looked correct.

- The linter caught real things: colour literals, `!important`, reaching past the tone axis. It could not catch any of the above, and says so: *"static checks cannot see rendering."*
- **The valuable tool wasn't the generator. It was the oracle.** I built a computed-style probe (iframe + `getComputedStyle`) and leaned on it ~20 times. Screenshot diffing found the bugs; the probe explained them.
- Idea to develop: in agent workflows, *verification* is the bottleneck, and we keep building generators.

## Cost, honestly

- ~820 utility tokens converted by hand across 18 files.
- ~56 MCP calls; two-thirds were the same one-file-at-a-time lint in a loop.
- Removing daisyUI revealed it had been silently restyling inline code and prose that nothing asked it to. Utility stacks accumulate invisible entropy.
- 27% of the CSS I wrote is comments. The durable artifact is the explanation, not the declarations — which is itself an argument about what code is for now.

## Open questions

- Does this hold at 10× the components, or does the algebra's fixed cost stop amortising?
- Is "context-resident cost" a metric worth tracking deliberately?
- Utilities won partly by being ugly-but-honest. Is an algebra honest in the same way, or does it move the lie somewhere a linter can't see?
