theme: Rojos
autoscale: true
footer: Vikram Rojo · Design Engineering Case Study
build-lists: true
slide-transition: fade(0.3)

# [fit] Agent Scaffolds

## Four products shipped solo since April by defining the scaffolds agents build in

**Design Engineer · Postbyte LLC · April–November 2026**

Finsum (live) · Langol (TestFlight) · Sinfon (beta) · Wondo (beta)

^ This deck covers four products I've shipped at Postbyte, my one-person studio, since April. They're very different: a money coach in WhatsApp, an on-device language trainer, a quarter-tone music sketching app, and an interactive-fiction marketplace. They share one idea. When agents do most of the typing, the design work moves upstream, into the scaffold: the stack, skills, MCP servers and specs I define, which the agents then build the application inside. I'll take each product as a test of one constraint I designed into its scaffold. Then I'll show what shipped and what I'd change.

---

## I define the scaffold and agents build the application, so my design decisions live where agents can't drift from them

**Web scaffold:** Flue agent harness over TanStack, Hono and Cloudflare, wrapped in Capacitor for mobile

**Native scaffold:** SwiftUI and Apple Intelligence for iOS and macOS

Each one is assembled from the skills and MCP servers its stack needs. Claude plans, Mimo builds and reviews, Claude Design prototypes, and Figma holds what survives.

A prototype takes between a weekend and a week.

^ Here's the problem these scaffolds solve. Agents make code cheap and judgment expensive. Left alone, an agent produces a plausible, generic app that quietly ignores the decisions that make a product good. Prompts are forgotten between sessions, and Figma comps don't constrain code. So I fixed the stack per platform, which means agents spend their context on the product instead of infrastructure choices. Then I put the decisions where agents have to read them. The agents type, and I own the one-way doors: trust boundaries, file formats, and what the product refuses to do. If someone asks whether this is just vibe coding, the answer is no. It's the opposite. The scaffold is how I keep taste enforceable at volume.

---

## Specs are the design artifact: each capability is a spec, and the spec changes in the same commit as the behaviour

- `CLAUDE.md` names each repo's source of truth
- `openspec/specs/`: one spec per capability. Langol has 24 and Sinfon has 33
- `openspec/changes/` holds work in flight, with delta specs
- When code and spec disagree: find out which is wrong, and fix both together

^ I don't make comps that get translated into tickets. I write specs. A spec captures the research and the design intent, gets checked against the core job before any code, and then becomes the contract the agents build against. On a solo project, a separate comp and a separate ticket are just rework. The rule I care most about is the last bullet. Code and spec drift, especially with agents, so it's a standing instruction to work out which one is wrong and fix the spec in the same commit as the behaviour. For a design engineering audience, this is where I'd slow down. It's how a design system's intent survives being implemented by something that doesn't remember yesterday.

---

## Finsum removes the app: your weekly budget is a WhatsApp thread with undo

- Set a weekly baseline, text "12 lunch", and every reply shows what's left
- "undo" reverses any spend. "@" lists your goal and debt funds
- The week closes itself, and the recap arrives with your next message
- No bank login: Finsum knows only what you send it

**Live** at finsum.app · free, limited launch group

^ Budgeting apps fail at the moment of logging. Opening an app, finding the screen, categorising: that friction is where people quit. So Finsum lives where people already type. The interesting design work is that the screens disappear and the craft moves into grammar, reply copy and recoverability. Every reply has to show the one number that matters, what's left this week. Undo has to be one word, because there's no back button in a chat. And the recap waits for your next message instead of pushing a notification, because an unprompted message from a money app feels like nagging. Skipping the bank connection was also a trust decision. It means less automation, but there's nothing to breach and nothing to explain.

---

## Langol keeps every inference on the device, so the whole app works in airplane mode

- Grading, speech, translation and between-session coaching all run on-device with FoundationModels
- System frameworks only, with no third-party dependencies in the app target
- Apple is used only for storage and delivery: Background Assets for lessons, private CloudKit for progress
- Every intelligence feature has a fallback: self-assessment without Apple Intelligence, typing without the microphone

**One codebase, two App Store products:** Langol (Romance) and Langol ESL

^ The rule at the top of Langol's README is "no inference ever leaves the device, and no service we operate exists." That's a product decision as much as an engineering one. It's a language app you can use on a plane, and the privacy story is short enough to be true. The constraint shaped everything: no server means no accounts, so progress lives in the learner's own iCloud. Shipping two App Store products from one codebase is handled by a single build-time flavor, so the conditional compilation sits in one file and nowhere else. On the design system side, the colour roles are five hues at one OKLCH lightness and chroma, gamut-mapped offline. The values are derived, not picked, and the doc says so, so nobody "adjusts" them later.

---

## Langol lets Swift decide what's decidable and the model only what isn't: 0 false positives in 260 judgements

- Gender agreement and conjugation are decided in Swift from bundled data. The model's category list doesn't contain them
- The checker **abstains** whenever it isn't sure
- Tested on 500 native Tatoeba sentences per language, unmodified and perturbed
- Spanish: 0 false positives, 0 missed, 0 spurious. Other languages are reported as **unmeasured**, not perfect

^ This is the decision I'd most want to defend in a technical interview. A model that invents a conjugation for a verb it has seen a million times isn't an acceptable teacher, and the data to get it exactly right was already in the bundle. So whatever can be looked up is decided in Swift. The model's output type structurally can't express those categories, so it can't emit them even if asked to. The model keeps what depends on meaning, like *por* versus *para*. Abstention is the load-bearing half: telling a learner their correct answer is wrong is worse than missing an error, and it's the failure they'll report. And I report the languages without a detector as unmeasured. Running the Spanish lexicon over French would return zero findings and look like a perfect score. Being honest about evaluation is part of the design.

---

# Sinfon

## A quarter-tone sketching app where LilyPond engraves and the app owns the music

- 24-TET: maqam and Western scales on one grid, for Mac and iPad
- The file format is a strict subset of LilyPond, so every sketch is a real score
- Scales guide, never block: out-of-scale notes are advice, never refusals
- Imports 30 of 32 Mutopia LilyPond files, 29 of them clean

**Beta** · 1.0 macOS build signed and packaged

^ Sinfon comes out of my own music work, including a maqam firmware fork, and the gap is real: mainstream notation tools treat quarter-tones as an edge case. The architecture line is sharp. LilyPond engraves and holds the notes, but it has no music logic, and the app plays from its own model. That keeps one source of truth and lets the file stay human-readable. "Guide, never block" is the interaction principle. Composers bend scales deliberately, so the picker marks what's in scale and the validator reports the rest as information, never as errors. It started on October 19 from an init doc that split every setup step between "You, in Xcode" and "Claude Code." That split is the scaffold idea in miniature: I define it, and the agent builds.

---

## Sinfon hosts its own MCP server, so Claude edits the open sketch through the app's undo stack

- Claude's edits use the same edit commands as the grid and inspector
- Each Claude edit is one undo step, with harmony-follow and phrase rules applied
- "Allow Claude to edit open sketches" is **off by default**. Claude can always read
- The Activity tab marks every change as yours or Claude's, with Undo

^ This is where the scaffold idea turns outward. The sinfon-sketch skill already let Claude write sketches, but composers had to carry the file back and forth and hope it reopened as editable. Now, while Sinfon is open, Claude Code or Claude Desktop connects through a small helper bundled in the app. The key decision was that there's no second edit path. Every operation became one edit command shared by the grid, the inspector and the MCP tools, so Claude can't do anything a user couldn't, and everything it does is undoable. Consent is off by default, and attribution is visible. These are the same rules I hold my own agents to: act through the product's own paths, with permission, reversibly. Here they've become a user-facing feature.

---

## Wondo was the first proof: a two-sided marketplace built by descoping to fit the scaffold

- Interactive-fiction marketplace: authors publish in Ink and readers browse, read, tip and subscribe on mobile
- Emdash CMS did double duty as platform and **agent scaffold**. If a feature could be descoped to fit it, it was
- Stripe Connect means authors own their stores
- Hardest engineering: making sign-in and checkout feel like one surface across providers

**Beta** at wondo.app

^ Wondo came first, and it's where the method started. The bet was supply-side: itch.io publishes a ratio of about seven developers per player, so the wedge is lowering the engine and distribution cost authors pay, not building a better reader. Using Emdash as the scaffold meant the default question on any feature was "what can I descope to fit?" rather than "what do I need to build?" I adopted Ink, Inkle's open-source runtime, so authors coming from other tools transfer right away. And I dogfooded it by adapting public-domain Gutenberg science fiction into playable titles. The lessons from Wondo became the two scaffolds that every product since has used.

---

## Four products shipped in seven months by one person

[.column]

**Shipped**

- **Wondo:** public beta, wondo.app
- **Finsum:** live, finsum.app, limited launch
- **Langol:** TestFlight, two App Store products
- **Sinfon:** beta, signed 1.0 macOS build

[.column]

**What carried across**

- Two scaffolds instead of four stacks
- Spec-first, with QA before every commit
- Trust boundaries written as architecture
- Store, privacy and licensing work done in-house

^ What I want a reviewer to take from this slide is range at a consistent level. These are a WhatsApp service, a native Apple Intelligence app, a pro-audio document app and a web marketplace, and all of them reach a real distribution channel. The unglamorous work counts too. Langol's privacy policy, privacy manifest and App Store questionnaire are kept in agreement as three artifacts. Sinfon can't go on the Mac App Store because engraving runs the user's own LilyPond, so it's moving to direct sale through Polar with a 30-day trial. After a lapse the grid becomes read-only, so nobody is ever locked out of their files. If I'm asked for usage numbers, I'll be straight: correctness is measured precisely, and adoption metrics are what I'm building next.

---

## Design leadership moves upstream: decide what the environment makes impossible

- Data that can't leave the device
- A model that can't judge what a table can decide
- An agent that can't edit outside the user's undo stack

**What I'd do differently:** instrument outcomes as early as correctness.

^ The through-line is that on a solo, AI-native team, my leverage isn't drawing every screen. It's deciding what the environment makes impossible, then writing that down where agents have to read it. Each product has one of those lines: Langol's device boundary, the decidability split, Sinfon's single edit path, and Finsum's choice not to touch your bank. That's design engineering as I practise it now: design judgment expressed as constraints that hold. What I'd change is measurement. I built evaluation suites before I built analytics, and next time I'll instrument outcomes from day one. I'd bring this same approach to a team, where the scaffold becomes the shared design system for humans and agents alike.
