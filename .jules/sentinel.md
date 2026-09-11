## 2025-05-18 - Unbounded User Inputs & LocalStorage Persistence DoS

**Vulnerability:** Unbounded string input fields (`prenom`, `besoin`, `address`, `options`, `creneauId`) allowed arbitrarily large text payloads in form inputs and Zod schemas.
**Learning:** In client-side single-page applications persisting state to `localStorage`, oversized payloads stored without strict maximum length bounds trigger `QuotaExceededError` crashes, high memory usage, and client-side DoS during JSON serialization and deserialization.
**Prevention:** Always enforce dual-layer maximum length constraints using HTML `maxLength` input attributes and Zod `.max(...)` schema limits on all string inputs and persisted state properties.
