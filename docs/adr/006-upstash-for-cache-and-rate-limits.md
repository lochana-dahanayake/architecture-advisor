# ADR-006: Upstash Redis for cache and rate limits

- **Status:** Superseded (2026-11-10). Never set up; the owner chose to keep the in-memory `KvStore` per server instance (OPEN_QUESTIONS Q25). Kept for the record

## Context
Serverless instances don't share memory, so an in-memory cache or rate counter is forgotten or split across copies. AI quota is the scarcest resource and needs per-IP and global limits.

## Decision
Use Upstash Redis (free tier, HTTP-based, works from serverless functions) with `@upstash/ratelimit`, created through the Vercel Marketplace so its credentials are injected as server-only env vars. It stores the tiered AI cache (`AI_INTEGRATION.md` §7), rate-limit counters and circuit-breaker state. If Redis is down, the app falls back to per-instance memory and still returns rule results.

## Consequences
- ~4 Redis commands per request; the free tier covers far more than expected traffic.
- One more account for the owner to create (a one-click Marketplace sign-up).
- Cached AI text is keyed by a hash; notes are never logged.
