---
title: The token cost of abstraction
description: I moved this site off Tailwind and daisyUI onto largen, a property algebra for CSS. The measurements are interesting. What they imply about writing code an LLM has to read, and about what tooling a library owes an agent, is more interesting.
date: 2026-08-23
tags: ['css', 'ai', 'engineering']
authors: ['vikram']
draft: true
---

> Skeleton. Data is final and measured; prose is placeholder.

## The setup

- This site: Astro 6, Tailwind v4, daisyUI v5, shadcn/radix component layer.
- Moved to [largen](https://largen.dev) — "a property algebra for CSS." Plain CSS, no build step, no plugin.
- 18 commits, verified page-by-page against the old build.
- Started at 0.2.0 vendored by hand off a CDN. Ended at 0.3.1 from npm. That gap is part of the story.

## What largen claims

- Fourteen custom-property slots. Four axes: tone, variant, size, state. One universal paint rule.
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
- **No leading slot** — at the time. The paint rule covered twelve properties; `line-height` wasn't one. Set `--font-size` without it and the component silently grows. Caught me four separate times. It's a slot now, which is the point of the next section.
- Idea: an algebra is a claim about which things are the same. It pays where the claim holds and taxes you where it doesn't.

## The failures were never in the algebra

Worth the most words. Every bug that cost me real time was a *cascade* problem, not a contract problem:

- CSS sublayers inherit their parent's position. `site.base` and `site.overrides` could never straddle `largen.*`, so a global `* { --weight }` silently outranked the component that set it. An explicit `--weight: 900` computed as 300.
- Tailwind's preflight sorts last by default, which flattens every heading, list and border in a component authored below it. Layer order beats specificity, so no selector weight recovers it.
- largen shipped its light tokens layered and its dark theme unlayered — so dark-mode overrides were silently ignored while light ones applied. 99.6% of pixels differed and the CSS looked correct.
- `--fg: inherit` on a link looked right and was wrong. `revert-layer` hands a property back to the *user-agent* stylesheet, not to the ambient value — so the correct answer is `currentColor`. Mine rendered correctly only by accident: an unrelated rule happened to be the revert target.

- The linter caught real things: colour literals, `!important`, reaching past the tone axis. It could not catch any of the above, and says so: *"static checks cannot see rendering."*
- **The valuable tool wasn't the generator. It was the oracle.** I built a computed-style probe (iframe + `getComputedStyle`) and leaned on it ~20 times. Screenshot diffing found the bugs; the probe explained them.
- Idea to develop: in agent workflows, *verification* is the bottleneck, and we keep building generators.

## What a library owes an agent

The section to expand most. largen is unusual in having thought about this, and the gaps it still had are the interesting part.

**What was already right**

- **A contract sized for a context window.** `/llms-compact.txt`, ~2,400 tokens, complete. Not a docs site to crawl — one file, authoritative, versioned with the code.
- **An MCP server that refuses to be a generator.** Six tools, no API key, and pointedly *no* `generate_ui`. Compare the default assumption that AI tooling means "make it write the thing."
- **A linter that quotes the rule back.** `check_component_css` didn't just reject my callout approach — it explained that *setting* `--tone` is feeding the axis rather than reaching past it, which is what let me map 24 variants onto a 7-value axis with confidence instead of a hunch.
- **`get_component_source` as copy-in, not import.** "largen ships an algebra, not a dependency." The tool hands you source to own, which is the correct relationship for an agent that will edit it anyway.

**What was missing, and why it's the harder half**

- The tools were weighted almost entirely toward **authoring**. Writing largen components was never the bottleneck — I wrote eleven stylesheets quickly and they passed the linter first or second try.
- The bottleneck was answering *"what is this element's computed value, and which rule decided it"* — roughly twenty times, against a codebase where two systems overlapped for nine commits.
- I sorted those twenty by the question actually being asked. **Two thirds were cascade arithmetic, not rendering.** I reached for a browser because it was the only oracle available, not because the question needed one.

**The shape of a verification tool**

Ideas worth drawing out, each earned from a specific incident:

- **Explain *why*, not just *what*.** `largen cascade` prints the resolved layer order next to the losing declaration. That's the difference between "it's broken" and "site-base sorts later because sublayers inherit their parent's position."
- **Refuse when you can't decide.** Asked about a selector with a descendant combinator inside `:not(:where(…))`, `cascade` declined and pointed at `probe`. That refusal is worth more than a confident guess — and is the opposite of what the probe did to me (below).
- **Ship the harness, don't host it.** A rendering endpoint taking arbitrary HTML is remote code execution unless sandboxed. Emitting a self-contained probe the caller runs locally has none of that surface. Security objections often kill the *deployment*, not the idea.
- **Batch.** Two thirds of my MCP traffic was the same one-file lint call in a loop. 27 calls → 1.
- **Local beats remote.** `largen verify` in the package does what the MCP call does, with no round trip. The network version should be the fallback, not the default.

**The failure mode of verification tools**

The best story in the post, and it happened at the very end.

- I reported that the probe's `--theme` switching gave wrong values. It was fixed in a patch release: the override is now held with a MutationObserver and *verified* before any value is reported.
- I re-ran it. Same wrong values — but now each row carried `theme: {"data-theme": "light"}`, attesting that the override was in place.
- So I believed it, built my own harness that reproduced the result, and concluded I had a real light-mode bug: near-white text on a white page.
- I didn't. Driving the page's *own* theme source instead — setting `localStorage` and letting the page apply light itself — gave correct values everywhere.
- **The tool verified the attribute, not the palette.** It proved the thing it could see was right, and attested to it, while the thing I cared about was wrong. The tell was that `body` background read light while every text colour read dark, which is impossible in one settled recalc.
- Idea: **a verification tool that checks a proxy is worse than none, because its confidence defeats the human check.** I would have caught this faster with no `theme` field at all.

**The feedback loop is new**

- Between my two vendorings, 21 commits landed upstream, several directly from this migration's reports.
- The three tools I sketched in a design doc — resolve the cascade, explain a slot, emit a probe — shipped in the next release as `largen cascade`, `largen slot`, `largen probe`.
- An agent doing a migration is an unusually thorough bug report: it exercises the whole contract in days, keeps every failure, and can say precisely which sentence of the docs was wrong.
- Idea: this is a genuinely different adoption dynamic, and library authors should expect it.

## Cost, honestly

- ~820 utility tokens converted by hand across 18 files.
- ~56 MCP calls; two thirds were the same one-file-at-a-time lint in a loop. With batching: ~20.
- Removing daisyUI revealed it had been silently restyling inline code and prose that nothing asked it to. Utility stacks accumulate invisible entropy.
- 27% of the CSS I wrote is comments. The durable artifact is the explanation, not the declarations — which is itself an argument about what code is for now.
- I broke my own vendoring: a `prettier --write` over the styles directory reformatted the "byte-for-byte upstream, never edited" files, silently killing the drift detection they existed for. A dependency can't be reformatted by a glob. That's an argument for npm over vendoring that I'd have dismissed in the abstract.

## Open questions

- Does this hold at 10× the components, or does the algebra's fixed cost stop amortising?
- Is "context-resident cost" a metric worth tracking deliberately?
- Utilities won partly by being ugly-but-honest. Is an algebra honest in the same way, or does it move the lie somewhere a linter can't see?
- If verification is the bottleneck, what does a *test framework* for CSS look like — and why doesn't one exist?
