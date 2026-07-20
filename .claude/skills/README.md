# Jewell Client Site Build — Skill Bundle

Skills bundled for client website work under Claude Code. Committed here so
they're available in any environment cloning this repo, including cloud
sessions (which only see what's checked into the repo — not personal
`~/.claude/skills/` or the claude.ai Skills library).

## Tier 1 — engagement structure & narrative (non-negotiable for client work)

- **jp-3d-core** — structural spine for the 3D Process. Output codes, folder
  placement, gate reviews. Governs where every artefact belongs.
- **jp-3d-discover** — Discover-phase method. Audience teardown, competitor
  analysis, killer questions. This is where the client's positioning and
  differentiation actually get extracted before any copy or design starts.
- **copywriting** — turns discovery insight into site copy: headlines, hero
  sections, CTAs, page-level messaging.
- **stop-slop** — strips AI writing tells from prose. Keeps client-facing
  copy sounding like a real founder, not a template.
- **taste-skill** — anti-slop frontend direction for landing pages,
  portfolios, and redesigns. Infers design direction from the brief.

## Tier 2 — strengthens execution

- **frontend-design** — broader design-system judgment (typography, layout,
  avoiding generic AI aesthetics) once taste-skill has set direction.
- **design-motion-principles** — purposeful motion/interaction design, plus
  an audit mode for catching AI-slop animation patterns.
- **ui-ux-pro-max** — concrete design-system decisions: styles, palettes,
  font pairings, chart types, across 10 stacks.

## Tier 3 — situational

- **copy-editing** — use when the client supplies existing copy to polish
  rather than writing from scratch.
- **seo-audit** — post-launch technical SEO audit. Not part of the build
  itself, but relevant once the site is live.

## Not included

`jp-brand-document` / `jp-brand-presentation` (Word/PPTX deliverable
formatting — not code-relevant) and the CKM-branded skills (ckmbrand,
ckmdesign, etc. — unconfirmed whether these belong to a Jewell client;
left out of client-repo templates until confirmed).

## Install

Already in the right place. Drop this whole repo (or just this
`.claude/skills/` folder) into a new project and Claude Code will
auto-discover every skill here — personal `~/.claude/skills/` skills are
NOT needed alongside this for cloud sessions to work, since cloud sessions
only clone what's in the repo.
