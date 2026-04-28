# empirical-prompt-tuning — reference templates

## Subagent invocation contract

Paste the following into the executor prompt. Fill `<>` placeholders.

````markdown
You are an executor reading <target prompt name> with a blank slate.

## Target prompt
<Paste the full body of the target prompt, or specify a path for Read>

## Scenario
<One paragraph setting the scenario context>

## Requirements checklist (items the deliverable must satisfy)
1. [critical] <item that belongs to the minimum bar>
2. <normal item>
3. <normal item>
...
(Judgment rules are canonically defined in "Workflow 4. Two-sided evaluation / Instruction-side measurements". At least one [critical] is required.)

## Task
1. Follow the target prompt to execute the scenario and produce the deliverable.
2. On completion, respond with the report structure below.

## Report structure
- Deliverable: <artifact or execution summary>
- Requirement achievement: ○ / × / partial (with reason) for each item
- **Trace** (tag OK / stuck / skipped for each phase, one-line reason when not OK):
  - Understanding (reading the instruction and building a mental model)
  - Planning (deciding the approach / ordering)
  - Execution (actually doing the work)
  - Formatting (shaping the deliverable to the expected form)
  - *Collapsed form allowed*: when all four phases are OK, a single line `Trace: all OK` is sufficient. Emit phase-by-phase only when any phase is stuck or skipped.
- **Unclear points (structured)**: for each issue, three lines:
  - Issue: <what observably happened>
  - Cause: <why, diagnosed at the instruction level>
  - General Fix Rule: <a class-level rule, not a spot fix, that would prevent this class of mistake>
- Discretionary fill-ins: places not fixed by the instruction and filled in by your own judgment (bullets)
- Retries: number of times you redid the same decision and why
````

The caller extracts the self-report from the report and fills the evaluation table using `tool_uses` / `duration_ms` from the Task tool usage meta **when available** (see [SKILL.md](SKILL.md) — Cursor measurement).

---

## Evaluation axes

| Axis | How to capture | Meaning |
| --- | --- | --- |
| Success/failure | Did the executor produce the intended deliverable (binary) | Minimum bar |
| Accuracy | Achievement rate of the requirements checklist (%) | Degree of partial success |
| Step count | Tool-call / decision-step count used by the executor | Instruction waste / wandering |
| Duration | Executor `duration_ms` or equivalent | Proxy for cognitive load |
| Retry count | How many times the same decision was redone (self-report) | Ambiguity signal |
| Unclear points (self-report) | Bullets | Qualitative improvement material |
| Discretionary fill-ins (self-report) | Bullets | Surfaces implicit specification |

**Weighting**: Qualitative (unclear points / discretionary fill-ins) is primary; quantitative (time / step count) is auxiliary. Chasing only time reduction makes the prompt too thin.

### Qualitative interpretation of `tool_uses`

If one scenario’s `tool_uses` is **3–5× or more** vs the others, the skill may be **decision-tree-index-leaning with low self-containment** (forced reference descent). Even at 100% accuracy, a skew in `tool_uses` can justify another iteration (e.g. add an inline minimum example at the top of the target prompt).

### Cursor: when usage meta is missing

- If `tool_uses` / `duration_ms` are **not** attached to the Task return: use `—` in the table and footnote **metadata unavailable**. Do not estimate.

---

## Per-iteration presentation format (for the user)

````markdown
## Iteration N

### Changes (diff from previous)
- <one-line fix content>
- Pattern applied: <pattern name from ledger, or "(new)">

### Execution results (per scenario)
| Scenario | Success/Failure | Accuracy | steps | duration | retries | Weak phase |
| --- | --- | --- | --- | --- | --- | --- |
| A | ○ / × | n% | n or — | ns or — | n | — or phase name |

### Structured reflection (newly surfaced this time)
- <Scenario B>: [critical] item N is × — <one-line reason for drop>
  - Issue: …
  - Cause: …
  - General Fix Rule: …

### Discretionary fill-ins (newly surfaced this time)
- …

### Ledger updates
- Added: …
- Re-seen: … — existing fix did not prevent recurrence because …

### Next fix proposal
- <one-line minimum fix>

(Convergence check: X consecutive clears / Y rounds remaining to stop condition)
````

**On failure**, add a one-line note to the unclear-points section stating **which `[critical]` item dropped**.

---

## Fix propagation patterns (conservative / overshoot / zero-shoot)

Fix → effect is not linear.

- **Conservative swing** (estimate > actual): one fix aimed at multiple axes but only moved one.
- **Overshoot** (estimate < actual): one structural bundle (e.g. command + config + expected output) satisfied multiple judgment wordings at once.
- **Zero-shoot** (estimate > 0, actual = 0): a fix inferred from an axis name did not reach any judgment wording.

Before applying a fix, have the executor verbalize **which judgment wording** the fix satisfies. When adding a new evaluation axis, concretize criteria to a granularity the subagent can judge.

---

## Failure pattern ledger

Entry format:

````markdown
- **Pattern name**: <short descriptive handle (not "ambiguous X")>
  - Example: <representative Issue wording from some iter>
  - General Fix Rule: <class-level rule from structured reflection>
  - Seen in: iter N, iter M, …
````

Rules:

- Before generating a fix in Workflow step 5, scan the ledger. If `General Fix Rule` matches an existing entry, update `Seen in` and ask why the existing fix did not prevent recurrence before adding a new entry.
- A pattern recurring **3+** times despite fixes → escalate to divergence (rewrite structure, not more patches).
- The ledger is **per target prompt**, not global across all runs.

---

## Iteration stopping criteria

- **Convergence (stop)**: 2 consecutive rounds (3 for high-importance) satisfying all of: (1) zero new unclear points, (2) accuracy improvement vs previous +3 points or less, (3) step count within ±10%, (4) duration within ±15%. **Hold-out check**: add one hold-out scenario not used so far; if accuracy drops ≥15 points from the recent average, treat as overfitting and revisit scenario design.
- **Divergence**: if new unclear points do not decrease across **3+** iterations, suspect the prompt design direction.
- **Resource cutoff**: stop when importance vs improvement cost no longer balances (“ship at 80 points”).

---

## Variant exploration (optional, plateau-breaking)

When iterations plateau without meeting convergence, run a 2-variant round:

- **Conservative variant**: current prompt + next-best minor fix
- **Exploratory variant**: current prompt + one structural change (reorder, split a dense paragraph, drop redundancy, add a worked example)

Dispatch fresh subagents on the same scenarios in parallel. Prefer higher accuracy; on tie, fewer unclear points; on further tie, lower `tool_uses`. Do **not** ask an executor to rate “A vs B” directly; compare objective axes only.

---

## Red flags (beware of rationalization)

| Rationalization that surfaces | Reality |
| --- | --- |
| "Rereading it myself has the same effect" | You cannot view text you just wrote objectively. Always dispatch a new subagent. |
| "One scenario is enough" | One scenario overfits. Minimum 2, ideally 3. |
| "Zero unclear points once, so we're done" | Could be coincidence. Finalize with 2 consecutive rounds. |
| "Let's knock out multiple unclear points at once" | You lose track of what worked. One theme per iteration. |
| "Metrics are good, so ignore qualitative feedback" | Time reduction can also mean the prompt is too thin. Keep qualitative primary. |
| "Let's reuse the same subagent" | It has learned the previous improvements. Always dispatch a new one. |

---

## Common failures

- **Scenario too easy / too hard**: neither produces signal. One median real use, one edge.
- **Only looking at metrics**: chasing only time reduction strips explanations and makes prompts fragile.
- **Too many changes per iteration**: you can no longer trace which fix worked.
- **Tuning scenarios to match the fix**: making scenarios easier just to clear unclear points — putting the cart before the horse.
