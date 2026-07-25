# Sentinel's Journal

## 2025-07-25 - Prevent client DoS via localStorage QuotaExceededError
**Vulnerability:** Input fields persisted to localStorage on every keystroke lacked length constraints, allowing potential storage exhaustion and QuotaExceededError crashes.
**Learning:** Automatically syncing React state to localStorage without limits presents a client-side Denial of Service (DoS) vector if large payloads are entered or pasted.
**Prevention:** Enforce strict Zod schema `max` constraints coupled with HTML `maxLength` attributes on all form fields that are synchronized with client-side persistent storage.
