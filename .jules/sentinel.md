# Sentinel Security Journal

## 2025-05-18 - Client Input Length Constraints & Storage Quota Exhaustion
**Vulnerability:** Unbounded text fields in user-facing forms and Zod schemas (`prenom`, `besoin`, `address`) allowed arbitrarily large string inputs that could be persisted directly into client `localStorage` via state serialization.
**Learning:** Persisting raw user inputs to client-side storage without strict schema maximum length limits (`.max(...)`) creates client-side resource exhaustion risks (`QuotaExceededError`) and client DoS vulnerabilities.
**Prevention:** Always pair Zod string validation schemas with explicit `.max(...)` constraints matching corresponding UI `maxLength` attributes on `<input>` and `<textarea>` components.
