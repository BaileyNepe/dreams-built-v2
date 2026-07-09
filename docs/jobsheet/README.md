# Job Sheet Builder

Replaces the Google-Sheets workflow for DREAMSBUILT foundation job sheets. A job
sheet attaches to a `Project` (one live sheet per project), lists the
foundation perimeter walls, auto-computes the **300 Shutters** and **Rebate**
cut lists per wall, keeps live tallies, prints on A4 in the paper layout, and
keeps versioned snapshots.

Open it from a project's detail page → **Job Sheet**.

## Domain conventions

- **Wall numbering**: wall 1 is the wall containing the garage door; walls
  proceed clockwise around the perimeter. In the app, list order _is_ the
  numbering (drag rows to renumber). A floor can have multiple garage walls;
  numbering just starts at whichever you put first.
- **Corners** (each wall end):
  - **External** (exposed) — the shutter may overhang past the corner. The
    packer uses _promotion_: the last greedy piece is replaced by the next
    standard size that covers the remainder (`3380 → [3600]`,
    `5940 → [4800, 1200]`); a piece is only added when the last is already
    the largest (`5010 → [4800, 600]`).
  - **Internal** (sheltered) — no overhang; the remainder becomes an exact
    **short** cut (`2060 → [1800, 260]`).
- **Absorb**: at an internal corner the perpendicular wall's shutter eats one
  shutter width (default 65mm) off this wall's run. Only one of the two walls
  absorbs it — tick "Absorb at start/end" on the wall the QS chooses.
- **Polystyrene shorts ("p")**: when both ends of a wall are internal, its
  short is polystyrene-padded (`355p`). Auto-flagged by rule; overridable per
  wall (Auto / On / Off).
- **Rebate**: runs along the inside of the perimeter shutter and **never
  overhangs**. Per end, an offset (default 120mm) applies where a
  perpendicular brick face crosses. Regular joinery does NOT stop the brick
  shelf — it runs through under doors and windows; only openings with "Has
  rebate" unticked (garage doors, by default) split the run into segments.
  Walls with no brick veneer at all: untick "Has rebate" → the row prints
  `-`.
- **BLK**: an inset piece (≈120×65) marking where rebate coverage starts or
  stops mid-wall. Tick BLK at a wall end, or place BLK pieces exactly where
  they belong via a manual override.
- **Partial brick — compound measurements**: type the wall as
  slash-separated segments with `b` (or `r`) on the brick stretches:
  `4200/810b` = 4200 bare then 810 brick; `3600b/2500/300b` = brick, bare,
  brick. The total becomes the wall length; the bare stretches become
  rebate insets (slab edge steps to the frame line, stepped shutter run,
  BLKs at the transitions, rebate only over the brick). A plain number or a
  suffix-free sum (`11610/1960` = 13570) clears the segmentation. The same
  stretches are editable in the wall panel under "Rebate insets". When brick
  stops at (or starts from) a corner, corner joints resolve against the
  neighbour's actual brick reach — no −120/+120 for a strip that never
  crosses.
- **Angled corners** (≠90°): enter the angle on the wall; shorts print with
  the annotation (`420 @45°`) and the floor plan turns by that angle. The
  app does not compute mitre trigonometry — annotation only.
- **Manual override**: replaces a wall's computed pieces verbatim. Overridden
  walls show an "edited" badge, stop recomputing (even if the measurement
  changes), and print with a `*` footnote until "Reset to computed".

## Editing the rules (no deploy needed)

Toolbar → **Rules** (managers only). Editable: the standard size list, the
shutter width, the rebate width, the BLK length, and the polystyrene
auto-rule. Rules apply to **new** sheets; every sheet keeps the frozen copy
of the rules it was created with, so old sheets never silently change. A
"Use latest rules" button appears on a sheet whose rules are stale;
snapshots embed the rule set they were computed with.

> **TODO(bailey): confirm the real-world defaults** (all seeded in
> `apps/shared/src/jobsheet/defaults.ts` and editable in-app):
>
> | Value                   | Seeded default                                                                   |
> | ----------------------- | -------------------------------------------------------------------------------- |
> | Standard sizes          | 4800, 4200, 3600, 3000, 2400, 1800, 1200, 600                                    |
> | Shutter width (absorb)  | 65mm                                                                             |
> | Rebate width (offset)   | 120mm                                                                            |
> | BLK length              | 120mm                                                                            |
> | Auto-polystyrene        | on (both ends internal)                                                          |
> | BLK placement semantics | additive marker in the 300 run (`BLK_CONSUMES_LENGTH` flag in `computeSheet.ts`) |

## Architecture

```
apps/shared/src/jobsheet/          pure calculation engine (bun test)
├── types.ts                       zod schemas: rules, walls, sheet document, snapshot blob
├── defaults.ts                    DEFAULT_JOBSHEET_RULES (TODO-marked seeds)
└── engine/
    ├── packRun.ts                 greedy largest-first + overhang promotion
    ├── packRebate.ts              segment splitting (offsets + openings), never overhangs
    ├── computeSheet.ts            wall assembly, overrides, auto-poly, BLK, warnings
    ├── tallies.ts                 dynamic per-size tallies + shorts + blk
    ├── format.ts                  trade notation ("4800 355p BLK 420 @45°")
    ├── diff.ts                    snapshot comparison (walls by stable id, tally deltas)
    └── geometry.ts                perimeter walk for the floor plan + misclosure

apps/server/src/api/jobsheet/      tRPC routers (vitest, TEST_TYPE=unit)
├── service.ts                     logic against the Prisma client (unit-tested with a mock)
├── routes.ts                      jobSheets: CRUD + save + snapshots
└── rules-routes.ts                jobSheetRules: getActive (lazy default) + update

apps/client/src/features/JobSheet/ editor UI (vitest + RTL)
├── state/                         reducer + provider + autosave + draft storage
├── WallTable/                     rows, breakdown chips, override & openings editors
├── FloorPlan/                     SVG slab with boxing bands
├── Snapshots/                     history drawer, view, compare, restore
├── SheetView.tsx                  paper layout (snapshot viewer + A4 print)
└── RulesDialog / InstructionsDialog / TallyPanel / SectionItems / toolbar
```

The engine is pure and total: given the sheet document plus a rules object it
returns every breakdown, tally and warning, and never throws on transient
editor states (blank measurements pack as empty; impossible absorb
combinations clamp to zero with a per-wall warning).

## Persistence, autosave and offline

- `JobSheet.data` (Json) holds only what the user authored; breakdowns are
  recomputed on load from `data` + the sheet's frozen `rules` copy. Every
  read path re-parses through the zod schemas, which doubles as a lenient
  migration layer (new fields must carry `.default()`s).
- **Autosave** debounces 1.5s and saves the whole document with an
  optimistic-lock `revision` (server applies via an atomic compare-and-swap;
  a stale revision returns CONFLICT and the editor asks for a reload).
- **Offline**: every edit is mirrored to a localStorage draft _before_ the
  debounce. If the connection is down the toolbar shows "Offline — saved
  locally", the browser's `online` event flushes immediately, transient
  failures auto-retry every 15s, and after a refresh the provider restores
  the draft (only when it was based on the server's current revision, so it
  never clobbers someone else's newer save).

## Snapshots

Toolbar → **History**. "Save" stores `{ data, rules, computed }` as
`JobSheetSnapshot` v1, v2, … with author and optional label. Any version can
be viewed in the paper layout, compared (against another version or the
current sheet — per-wall changes keyed by stable wall id, tally deltas, item
diffs), and restored. Restore snapshots the current state first inside the
same transaction ("Before restore vN"), so nothing is ever lost.

## Floor plan

The wall list is enough to draw the slab: lengths + corner directions walked
clockwise from wall 1. The panel shows the shutter boxing outside the slab
and rebate inside, each cut labelled; if the measurements don't return to
the start the gap is drawn dashed red with a "doesn't close by X mm" chip —
use it to catch entry mistakes. Optional in the print via its checkbox.

## Running the tests

```bash
bun run shared:test        # engine: golden 9-Warren-Lane parity + geometry (103 tests)
cd apps/server && TEST_TYPE=unit bunx vitest run src/api/jobsheet   # service (17 tests)
cd apps/client && bunx vitest run src/features/JobSheet             # UI state + components
```

The golden fixture (`apps/shared/src/jobsheet/fixtures/nineWarrenLane.ts`)
reproduces the QS-issued 9 Warren Lane job sheet cut-for-cut; any packer
change that breaks it is a regression by definition.
