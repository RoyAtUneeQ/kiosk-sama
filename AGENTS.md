# Code Style Rules

## Comments Policy

**DO NOT add JSDoc-style comments or block comments (`/** ... */`)**

This includes:
- Class/interface/type descriptions
- Method documentation with `@param`, `@returns`, `@example`
- Property descriptions
- Any multi-line block comments

**Acceptable:**
- Brief inline comments (`//`) only when logic is genuinely non-obvious
- Keep comments minimal - code should be self-documenting

**Rationale:** The codebase uses TypeScript with strong typing. Types themselves serve as documentation. Verbose comments add noise and become stale.
