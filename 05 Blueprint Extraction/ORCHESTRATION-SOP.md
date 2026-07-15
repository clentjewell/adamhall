# Standing Operating Procedure — Orchestrated Delivery (Jewell OS)

**Status:** Live · **Owner:** Clent Jewell · **Applies to:** every Jewell Projects prompt and engagement, all clients, all sessions.

This SOP is a standing instruction. It governs how work is produced across the Jewell OS, not just for Adam Hall. A copy lives in the Adam Hall repository as a worked reference; the authoritative version is pinned in the Jewell Projects knowledge base so it applies to any prompt.

## The rule

**A high-level model orchestrates. Lower-level models execute. The orchestrator checks every output.**

Run work as an orchestrated pipeline, not as a single model doing everything. The goal is a high-confidence outcome at the lowest sensible token cost.

## Roles

1. **Orchestrator (Opus, or the highest-level model available).**
   - Owns the plan, the sequencing, and the standard.
   - Holds the context, decides the file structure, and writes the brief for each execution step.
   - Handles anything needing judgement, authentication, or accuracy the whole job hangs on (git, credentials, commercial numbers, high-control detail, final synthesis).
   - Does NOT do bulk drafting or mechanical work that a cheaper model can do to standard.

2. **Executors (Sonnet, or a lower-level model).**
   - Do the bulk work: drafting long-form content, parsing, building files, batch generation, format conversion.
   - Receive a tight, self-contained brief with all facts baked in, so they never guess.
   - Return the artefact plus a short pass/fail self-check.

## The loop

1. **Plan.** Orchestrator breaks the job into steps and decides what is execution (delegate) versus what is judgement (keep).
2. **Brief.** Orchestrator writes each executor a complete brief: the facts, the constraints, the house rules, the exact output path, and the acceptance test.
3. **Execute.** Executors run in parallel where the steps are independent.
4. **Check.** Orchestrator reviews every output against the brief and the house standard before it ships. Render documents and read them. Grep for banned words. Verify numbers and high-control detail. Nothing ships unchecked.
5. **Fix or accept.** If an output misses, the orchestrator corrects it directly or re-briefs. Only checked work is delivered or committed.

## Token discipline

- Delegate drafting; keep synthesis and checking.
- Bake facts into the brief once, rather than having the executor rediscover them.
- Batch independent work into parallel executors.
- Do not delegate a task whose briefing cost exceeds the cost of just doing it. Short structural files, exact-path work, and credential steps are usually faster kept.

## Non-negotiables the orchestrator always enforces

- **House voice and brand.** Australian English, JP document/deck standards, no banned words, en dashes not em dashes.
- **HIGH-CONTROL.** Anything touching money, ID, PPSR, ownership, rego, payment or settlement is confirmed, never invented, and flagged as such.
- **Confirmed vs pending.** Never blur validated fact with hypothesis. Label drafts as drafts.
- **Filing.** Every artefact lands in the right Jewell OS folder, named to convention, and is logged in the Artifact Registry.

## Worked example — this repository

The Adam Hall knowledge upload used exactly this pattern: Opus orchestrated and handled git, credentials, structure and the commercial and high-control detail; Sonnet executors drafted the phase documents, the Intelligence Brief and KH00, and built the branded files; the orchestrator rendered, checked, corrected, then committed. See the Artifact Registry for the resulting inventory.
