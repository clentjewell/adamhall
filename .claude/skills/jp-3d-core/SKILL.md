---
name: jp-3d-core
description: "The structural spine for every Jewell Projects 3D Process engagement. Use this whenever scaffolding a new JP client folder, auditing an existing one, placing or naming an artefact, assigning an output code, tracking the Artifact-Registry, preparing a Gate 1 or Gate 2 review, or confirming where any output belongs. Triggers include any reference to the 3D Process, the Discover / Design / Deploy phases, JP folder structure, output codes in the D / DS / DD / KH / IB / MAP / B / BVG / SP / VV families, the Knowledge Hub Index (KH00), the Intelligence Brief (IB), file naming, version states, or gate sign-off. This skill governs structure, inventory, and filing only. It deliberately holds no method for building artefacts. For the thinking behind each phase, defer to the stage spokes: jp-3d-discover, jp-3d-design, jp-3d-deploy. For visual identity and house voice on any deliverable, use jp-brand-document. Use this skill alongside the relevant spoke, not instead of it."
---

# Jewell Projects 3D Process Core

The structural spine for every JP 3D Process engagement. It keeps folder structures, output codes, naming, status states, and gates identical across clients so any output can be found, named, and trusted.

This skill governs **structure and inventory**. It holds no method on purpose. The thinking that turns a brief into a Pottsville-grade artefact lives in the stage spokes. The visual identity and house voice live in `jp-brand-document`. Use this skill with those, not instead of them.

## The 3D suite (hub and spoke)

| Skill | Owns | Fires when |
|---|---|---|
| `jp-3d-core` (this) | Folders, codes, naming, status, gates, registry, scaffolding, session flow | Placing, naming, filing, scaffolding, auditing, gate logistics |
| `jp-3d-discover` | Method for D01–D08 (Discover) | Producing or reviewing Discover outputs, running Gate 1 |
| `jp-3d-design` | Method for DS01–DS20 (Design) | Producing or reviewing Design outputs, running Gate 2 |
| `jp-3d-deploy` | Method for DD00–DD15 (Deploy) and the Deepen rhythm | Producing or reviewing Deploy outputs, launch, reviews |
| `jp-brand-document` | Visual identity, house voice | Any document deliverable, any phase |

Rule of thumb: core tells you **where it goes and what it is called**; the spoke tells you **how to build it well**; the brand skill tells you **how it should look and sound**.

## Master folder taxonomy (every JP client)

Validated against the live Pottsville Acupuncture / Meridiann and Beyond the Clinic (BTC) folders, May 2026.

```
[Client Name]/
├── 00 Admin                          front-end, commercial, contacts, SOW, sign-offs
├── 01 Discover                       Phase 1 of the 3D Process
├── 02 Design                         Phase 2 of the 3D Process
├── 03 Deploy                         Phase 3 of the 3D Process
├── 04 Deepen + Intelligence          ongoing review rhythm + Knowledge Hub
├── 05 Blueprint Extraction           Jewell internal IP capture for the next playbook
├── 06 Source + Working + Imports     raw inputs, transcripts, drafts, imports
├── 99 Archive                        superseded versions, retired artefacts
└── meetings                          Circleback / transcript imports
```

Notes:
- `00 Admin` was previously `00 Front-End + Commercial`. Both names appear in legacy folders. New projects use `00 Admin`.
- `00 Pre-Review Archive — Original Versions` may sit at the top level after a major restructure. Preserve it as a frozen snapshot until the next quarterly clean-up.

### Inside each 3D phase folder (`01 Discover`, `02 Design`, `03 Deploy`)

Every phase folder uses the same four-stage promotion structure:

```
[Phase folder]/
├── 01 Inputs                  raw client material, briefs, transcripts, references
├── 02 Working Drafts          in-progress JP work, not yet client-ready
├── 03 Final Outputs           approved, canonical artefacts for the phase
└── 04 Review Decks            presentation/synthesis decks for the gate
```

Documents promote upward: `Inputs → Working Drafts → Final Outputs → Review Decks`. Only `03 Final Outputs` is canonical.

### Inside `00 Admin`

```
00 Admin/
├── 01 Contacts + Stakeholders
├── 02 Meeting Notes
├── 03 Approvals + Signoffs
├── 04 Commercial + SOW
├── 05 Timelines + Project Control
├── 06 Qualification
├── 07 Deal Memo
├── 08 Proposal + Pricing
├── 09 Close + Kickoff
├── 10 Forecast + System Updates
├── 11 Final Outputs
├── Artifact-Registry
└── Revenue Metrics & Operating Systems     (where applicable)
```

### Inside `02 Design`

```
02 Design/
├── 01 Strategy
├── 02 Customer + Journey
├── 03 Brand                          (or "Brand & Website Copy Workbook")
├── 04 Briefs
├── 05 Brand Identity                 (KH00-aligned layout)
├── 06 Digital Assets
├── 06 Website + UX
├── 07 CRM
├── 08 Presentation + Signoff
└── 99 Archive
```

Reshape note: the KH00-aligned numbering (Brand Identity 05, Digital Assets 06, Website + UX 07, CRM 08, Presentation + Signoff 09) is the target shape from 6 May 2026. Older folders may show pre-reshape numbering. Do not silently renumber an existing client folder. Flag it for a deliberate reshape decision first.

### Inside `03 Deploy`

```
03 Deploy/
├── 01 Launch Plan
├── 02 Channels
├── 03 CRM + Automation
├── 04 Website + CRO
├── 05 Content + Social
├── 06 SEO + Authority
├── 07 Reporting + Reviews
└── 08 Wins + Case Studies
```

### Inside `04 Deepen + Intelligence`

```
04 Deepen + Intelligence/
├── 01 [Client] Intelligence Brief    IB lives here
├── 02 Monthly Reviews                MR-Q1 ... MR-Q4
├── 03 KPI Baselines
├── 04 Insights + Learnings
├── 05 Next-Cycle Priorities
└── KH00 — Knowledge Hub Index        master front-door document
```

### Inside `05 Blueprint Extraction` (Jewell internal only)

```
05 Blueprint Extraction/
├── 01 Approved Source Outputs
├── 02 Blank Templates
├── 03 Prompt Packs
├── 04 Automation Notes
└── 05 SOP Updates
```

### Inside `06 Source + Working + Imports`

```
06 Source + Working + Imports/
├── 01 Raw Source Files
├── 02 Imports
├── 03 Working Files
└── 04 Exports
```

## Output codes by phase (canonical index)

Every artefact carries a stable two-to-four-character code anchoring it to a phase and a slot. Codes do not change between client implementations. The spokes hold the method for each. This is the index only.

### Discover (D-prefix) — method in `jp-3d-discover`

| Code | Title | Notes |
|---|---|---|
| D01 | Discovery Questions | Source questionnaire for discovery sessions |
| D02 | Audience Teardown | Target audience analysis |
| D03 | Competitor Analysis | Competitor landscape |
| D04 | Offer Worksheet *or* Killer Questions | Varies by client — confirm before assigning |
| D05 | Offer Worksheet *or* Internal/External SWOT | Varies by client — confirm before assigning |
| D06 | Discovery Pack Synthesis | The canonical master synthesis document |
| D06A | Discovery Addendum | Client-specific addendum (e.g. AHPRA library for Pottsville) |
| D07 | Discovery Readout | Verbal-form readout for the Gate 1 conversation |
| D08-DECK | Gate 1 Deck | Presentation form of the Discovery synthesis |

Pottsville reference set (live, v04): D01 Discovery Questions, D02 Audience Teardown, D03 Competitor Analysis, D04 Killer Questions, D05 Offer Worksheet, D06 Discovery Pack Synthesis, D06A Discovery Addendum.

### Design (DS-prefix) — method in `jp-3d-design`

Strategy core: DS01 Customer Profile (PAIN/GAIN/PROOF), DS02 Customer Journey, DS03 Marketing Plan (Always-On + Seasonal), DS04 Brand Strategy, DS05 Activation Plan, DS11 Sales-on-a-Page.
Copy + voice: DS06 Brand Copy Workbook → Brand Voice Guidelines, DS07 Website Copy Workbook, DS08 Magnetic Case Studies, DS09 Key Messaging Toolkit *or* Brand Identity Brief.
Brand identity + assets: DS09 Brand Identity, DS10 Style Guide, DS-CANVA-HANDOFF, DS11 Digital Assets Brief, DS12 Social Media Asset Plan, DS13 Photography Direction, DS14 Video Direction.
Website + CRM: DS15 CRM Platform Direction, DS16 Optimal Sitemap, DS17 High-Conversion Wireframes.
Synthesis + sign-off: DS18 Design Presentation Content (Gate 2 deck), DS19 3D Output Summary (one-pager), DS20 Design Sign-off, SOAP-DECK Strategy-on-a-Page Deck.

Numbering drift: live Pottsville and BTC files show DS04 Customer Profile and DS05 Customer Journey, while KH00 lists DS01/DS02. Treat KH00 as the target convention and existing filenames as legacy. Do not retro-rename without a deliberate reshape decision.

### Deploy (DD-prefix) — method in `jp-3d-deploy`

DD00 Launch Playbook (master), DD01 Website Build Brief / Domain + DNS / Project Mandate, DD02 Analytics + Tracking / Lead Nurture / Content Strategy, DD03 CRM Setup / Email Infrastructure / Website Brief, DD04 LinkedIn Launch / Social Content Calendar, DD05 Case Study Pages Live / Launch Plan, DD06 Press + PR Launch / Sales Enablement Pack, DD07 Partner Conversation / PR Media Brief, DD08 Lead Magnet Funnel / Partnerships Brief, DD09 Paid Media / Metrics + Reporting Dashboard, DD10 Speaking Bookings / Investor Relations Brief, DD11 KPI Dashboard, DD12 Post-Launch Report / Engagement Debrief, DD13 Rollback Procedure, DD14+ client-specific regulatory or platform briefs (e.g. nib-Approval-Request, TGA-SaMD-Brief for BTC).

Deploy slots are shared across artefact streams. Sub-titles disambiguate.

### Deepen + Intelligence (KH, IB, MR, KPI, QA, IL, NCP)

KH00 Knowledge Hub Index (single front door), IB Client Intelligence Brief (live single source of truth), MR-Q1…MR-Q4 Quarterly Reviews, KPI Baseline Tracker, QA01 Quarterly Voice Audit (≥80% adherence), IL Insights Log, NCP Next-Cycle Priorities.

### Vivid Vision + Activation + Playbook layer

VV01 Vivid Vision (5-year destination), WHY-DECK Why Document, MAP00 Master Activation Plan, MAP-CBC-01…06 Campaign Business Cases, MAP-CONTENT Content Plan, MAP-DATP Detailed Activity Task Plan (Asana-mapped).

### Sales + Marketing Playbook (SP)

SP01 Customer/Patient Journey + Stage SLAs, SP02 Reception/Front-line SOP + objection handling, SP03 Handoff SOP, SP04 Consolidated RACI.

### Brand Voice Guidelines (BVG)

BVG01 Pillars, BVG02 Red-Pen Rules, BVG03 Vocabulary, BVG04 Channel Dosage Guide, BVG05 Channel-Specific Tone Modulation.

### Briefs (B)

B01–B10 standard Jewell briefs. B11–B18 client activation-specific briefs.

### Blueprint Extraction (Jewell internal IP, no client prefix)

HELICOPTER-VIEW Cross-client learnings, AUTOMATION-ROADMAP, PLAYBOOK v1.x current and target methodology versions.

## File naming convention

Canonical (per KH00):

```
[CODE]__[Title]__[Client]__[Audience]__[Status]__v[NN].[ext]
```

| Field | Detail |
|---|---|
| CODE | Output code (DS06, D06A, DD03, KH00, B11) |
| Title | kebab-case title |
| Client | Long-form kebab-case (Pottsville-Acupuncture-Meridiann, Beyond-the-Clinic) |
| Audience | Internal (Jewell + senior client) or Client (sharable) |
| Status | Draft / Review / Final / Live |
| Version | v01, v02 |

Example: `DS07__Website-Copy-Workbook__Pottsville-Acupuncture-Meridiann__Client__Final__v01.md`

Legacy convention still in active use: `JP_[ClientCode]_[Phase][Num]_[TopicName]_v[NN].[ext]`, e.g. `JP_BTC_DS04_CustomerProfile_v01.docx`. The live Pottsville files use a third shorthand, e.g. `Pottsville_D06_Discovery_Pack_Synthesis_v04.docx`. Treat the long-form convention as the target. Do not retro-rename existing files without a deliberate housekeeping pass. Flag the standardisation question to Clent first.

## Status taxonomy

| Status | Meaning | Sharable? |
|---|---|---|
| Draft | Work in progress, not reviewed | No |
| Review | Awaiting client or internal review | Selective |
| Final | Approved, frozen for the current cycle | Yes |
| Live | Active operating document, updated in place (IB, KH00, KPI tracker) | Yes |

## Session workflow (running a 3D Process session)

### Before
1. Identify the phase and target output codes. Confirm with Clent which D / DS / DD codes are in scope.
2. Locate the inputs in the phase `01 Inputs`, in `06 Source + Working + Imports`, or in `meetings`. Read them before drafting.
3. Check KH00 for client-specific deviations (Pottsville D06A AHPRA addendum, BTC DD14 nib brief).
4. Read related approved outputs so the new artefact aligns. The IB and the prior phase `03 Final Outputs` are the strongest grounding.
5. **Open the matching stage spoke for method.** Core places and names; the spoke builds.

### During
6. Draft each output as a separate artefact. One code, one file. Do not bundle.
7. Apply `jp-brand-document` for visual identity and house voice.
8. Save drafts to `02 Working Drafts`, named with `Draft` status and `v01`.
9. Track every artefact in the Artifact-Registry under `00 Admin / Artifact-Registry/` as soon as created.

### After
10. Promote approved artefacts to `03 Final Outputs`, status `Final` (or `Live` for editable docs).
11. Update KH00 to reference the new artefact and increment the index version.
12. Update the IB if the artefact changes any live business intelligence.
13. Produce the gate deck in `04 Review Decks` if the session closes a phase.
14. Send superseded versions to `99 Archive`. Do not delete, never overwrite.

## Gates

| Gate | Closes | Output | Deliverable |
|---|---|---|---|
| Gate 1 | Discover | D08-DECK | Discovery readout deck; sign-off recorded in `00 Admin / 03 Approvals + Signoffs/` |
| Gate 2 | Design | DS18 + DS19 | Design Presentation deck and 3D Output Summary one-pager; sign-off in the same folder |

After Gate 2 the engagement enters Deploy. After Deploy it enters the ongoing Deepen + Intelligence cycle (no formal gate, quarterly reviews instead). Gate method and readiness checklists live in the relevant spoke.

## Scaffolding a new engagement — confirm first

1. Any client-specific codes beyond the standard inventory (regulatory briefs like BTC DD14/DD15, addenda like Pottsville D06A)?
2. Which long-form client name in filenames (Beyond-the-Clinic vs BTC)?
3. Scoped through Gate 2 only, or through Deploy and into Deepen + Intelligence?
4. Parallel clients whose IP capture in `05 Blueprint Extraction` should be cross-referenced?

## Related JP skills

- `jp-3d-discover` / `jp-3d-design` / `jp-3d-deploy` — the method for each phase
- `jp-brand-document` — visual identity and house voice for every JP document
- `jp-client-handover-v1` — universal handover checklist (credentials, asset archives, SOPs, invoice/contract closure)
