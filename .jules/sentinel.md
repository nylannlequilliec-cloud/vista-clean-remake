# Sentinel Journal - Vista Clean

## 2025-05-10 - Unbounded string inputs in client persistence & fast-check property constraints
**Vulnerability:** User input strings (`prenom`, `telephone`, `besoin`, `address`) and persisted state schemas (`tunnelStateSchema`) lacked maximum length constraints, allowing potential client-side DoS or localStorage `QuotaExceededError` via oversized payloads.
**Learning:** Adding strict Zod `.max(...)` limits in `schema.ts` and `persistence.ts` and matching HTML `maxLength` attributes mitigates memory/storage exhaustion. However, property-based tests in `persistence.test.ts` using `fast-check` generated unbounded strings that failed schema deserialization tests.
**Prevention:** Always pair Zod maximum length limits with matching `maxLength` constraints in `fast-check` string generators (`fc.string({ maxLength: ... })`).
