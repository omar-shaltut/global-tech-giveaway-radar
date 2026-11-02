# Global Tech Giveaway Radar

Free, evidence-first radar for global technology giveaways, designed for a user in Libya.

## Non-negotiable operating policy

A giveaway is never marked `QUALIFIED` merely because it looks attractive or says “worldwide”. The system preserves evidence and applies deterministic gates before surfacing a result.

Decision pipeline:

`Discovery → Deduplication → Official-source verification → Shariah Gate → Geography v1.8 → Financial Gate → Content Gate → Lifecycle → Evidence → Decision`

### Shariah Gate

Immediate rejection for paid entry, participant-funded draws, paid advantage / unequal paid odds, gambling or betting mechanisms, prohibited prizes/conditions, or campaigns that directly require promotion of excluded content. Ambiguous cases are `MANUAL_REVIEW`; the software does not issue religious rulings.

### Geography v1.8

A campaign explicitly described as Worldwide / Global is geographically acceptable unless Libya is explicitly excluded or the campaign itself applies a hard regional/shipping restriction that prevents fulfillment.

### Evidence standard

Qualified opportunities require a direct campaign URL and an official source/terms URL when available. Aggregators may be discovery leads but are not final authority.

## Cost constraint

Target operating cost: **USD 0/month**.

- No paid API is required for the core rules engine.
- No credit card is required by the application itself.
- Static dashboard is designed for GitHub Pages.
- Scheduled discovery can use GitHub Actions within the account's free allowance.
- Existing Airtable data is treated as a migration/source layer, not a permanent hard dependency.

## Repository structure

- `docs/` — zero-cost static web dashboard (Arabic RTL)
- `src/rules.js` — deterministic decision engine
- `src/schema.js` — normalized giveaway/evidence schema
- `data/giveaways.json` — local canonical demo/migration dataset
- `tests/` — rule-engine tests
- `.github/workflows/` — CI and scheduled jobs

## Status

MVP foundation under active development.
