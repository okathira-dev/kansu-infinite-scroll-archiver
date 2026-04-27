---
name: empirical-prompt-tuning
description: >-
  Iteratively improves agent-facing instructions (Cursor Skills, .mdc rules, CLAUDE.md, codegen prompts) by
  dispatching a fresh subagent as an unbiased executor and evaluating two-sidedly (self-report + checklist
  metrics) until improvements plateau. Use after creating or substantially revising instructions, when
  misbehavior may be instruction ambiguity, or when hardening high-traffic prompts.
---

# Empirical Prompt Tuning

> **Human readers (日本語):** workflow summary and repo context are in [OVERVIEW-ja.md](OVERVIEW-ja.md) (colocated). This `SKILL.md` follows the English source style of [mizchi/skills `empirical-prompt-tuning`](https://github.com/mizchi/skills/tree/main/empirical-prompt-tuning).

The author of a prompt cannot judge its quality. The clearer the writer thinks something is, the more likely another agent will stumble on it. The core of this skill is to **have a bias-free executor actually run the instruction, evaluate it two-sidedly, and iterate**. Do not stop until improvements plateau.

## When to use

- Right after creating or substantially revising a skill / slash command / task prompt
- When an agent does not behave as expected and you want to attribute the cause to ambiguity on the instruction side
- When hardening high-importance instructions (frequently used skills, automation-core prompts)

When not to use:

- One-off throwaway prompts (evaluation cost does not pay off)
- When the goal is not to improve success rate but merely to reflect the writer's subjective preferences

## Repository context (Kansu)

Do not duplicate long-form coding conventions in this skill. When editing target prompts, keep them consistent with:

- [`.cursor/rules/global.mdc`](../../rules/global.mdc)
- [`.cursor/rules/kansu-agent-conventions.mdc`](../../rules/kansu-agent-conventions.mdc)

User-facing explanations and commit/PR text for this project remain **Japanese** per `kansu-agent-conventions.mdc`.

## Workflow

0. **Iteration 0 — description / body consistency check** (static, no dispatch needed)  
   Read the triggers / use cases claimed by the frontmatter `description` and the scope the body actually covers. If there is a gap, reconcile description or body before moving to iter 1. If you skip this, the subagent will "reinterpret" the body to match the description, and accuracy will come out high even though the skill does not actually meet the requirements (false positive).

1. **Baseline preparation**: Fix the target prompt and prepare (a) **evaluation scenarios**, 2 to 3 kinds (1 median + 1 to 2 edge), and (b) a **requirements checklist** per scenario (3 to 7 items; **do not change after**). Include **at least one** `[critical]` item per checklist.

2. **Bias-free read**: Have a blank-slate executor read the instruction. **Dispatch a new subagent** via the Task tool. Do not substitute with a self-reread. When running multiple scenarios in parallel, place multiple agent invocations within a single message when the environment allows.

3. **Execution**: Hand the subagent a prompt that follows the **subagent invocation contract** in [reference.md](reference.md). The executor produces a deliverable and returns a self-report.

4. **Two-sided evaluation**: From the returned report, record executor self-report (unclear points, discretionary fill-ins, stuck template application), **trace** by phase (Understanding / Planning / Execution / Formatting), structured reflection (**Issue / Cause / General Fix Rule**), and instruction-side metrics (success only if all `[critical]` are met; accuracy; step count and duration — see **Cursor measurement** below; retries from self-report). On failure, add a one-line note stating **which `[critical]` item failed**.

5. **Apply the diff**: Apply the **minimum** change to the target prompt to remove unclear points. **One theme per iteration** (a few related micro-fixes may bundle; unrelated fixes wait). Before applying, state **which checklist / judgment wording** the fix satisfies. Consult **fix propagation** and the **failure pattern ledger** in [reference.md](reference.md).

6. **Re-evaluate**: Run steps 2–5 again with a **new** subagent (do not reuse the same executor). Increase parallelism if improvements do not plateau.

7. **Convergence check**: Follow **Iteration stopping criteria** in [reference.md](reference.md). Use **3 consecutive** clear rounds for high-importance prompts.

### Cursor measurement (steps / duration)

- If the subagent return includes **`tool_uses` / `duration_ms`** (or equivalent usage meta from the Task tool), use them as in upstream.
- If **not** provided: put `—` in the table and footnote **metadata unavailable**. Do **not** invent numbers.

## Environment constraints

If dispatching a new subagent is not possible (already running as a subagent, Task tool disabled, etc.), **do not apply** this skill end-to-end.

- Alternative 1: ask the user to run evaluation in a **separate Cursor chat / agent session**.
- Alternative 2: report explicitly to the user: `empirical evaluation skipped: dispatch unavailable`
- **NG**: substitute with a self-reread (bias enters; do not trust the result as empirical evaluation).

**Structural review mode**: When you only need consistency between `description` and body, state explicitly in the executor prompt that this round is **structural review only — no execution**. Structural review aids empirical tuning; it **cannot** replace consecutive-clear convergence checks.

## Optional: variant exploration

When plateauing without meeting convergence, see **Variant exploration** in [reference.md](reference.md).

## Additional resources

- Templates, tables, red flags, common failures: [reference.md](reference.md)
- **Divergences from upstream (canonical):** [upstream-divergences.md](upstream-divergences.md)

## Related (optional; not prerequisites)

- After-task codification: [mizchi/skills `retrospective-codify`](https://github.com/mizchi/skills/tree/main/retrospective-codify)
