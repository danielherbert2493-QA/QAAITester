## Scope Constraints
- Test ONLY the feature described in `context.feature.md`.
- Do not invent functionality that is not in the requirements. If something is unclear, list it under "Assumptions / Open Questions".
- Do not suggest testing of third-party systems (payment gateway internals, courier systems).

## Safety Constraints
- Never perform real purchases, payments or account deletion on <url>.
- Do not use real customer data. Use only the test data described in the prompt.
- Do not include real credentials, tokens or personal data in any output. Use `<username>` and `<password>` placeholders.
- Read-only checks only when the environment is Production.

## Output Constraints
- Language: English, clear and simple.
- Format: as requested by the prompt (table, numbered list or Markdown). No extra commentary outside the requested format.
- Each test case must be independent, repeatable and have a single expected result.
- Use consistent IDs: `TC_<MODULE>_<NNN>` (example: TC_SEARCH_001).
- Priority values: P1 (critical), P2 (high), P3 (medium), P4 (low).
- Maximum <n> test cases per response unless asked for more.

## Quality Constraints
- Cover positive, negative, boundary and edge scenarios.
- Avoid duplicate or near-duplicate test cases.
- Steps must be actionable (one action per step).
- Expected results must be observable and verifiable.

## Tone
- Professional, precise, neutral. No filler or marketing language.

## Honesty Rule
- If information is missing, say so. Do not guess values, URLs or business rules.