Turn a requirement or user story into reviewed, ready-to-use test cases.
Two steps: **review the requirement first**, then **generate test cases**.

Example requirement (Amazon, learning): *Add to Cart from the product page.*

## Inputs to prepare
- Requirement / user story / acceptance criteria: `<requirement_text>`
- Application URL: `<url>`
- Context files to paste: `context.project.md`, `context.feature.md`, `context.constraints.md`, `context.testing.md`

---

## Step 1: Requirement Review (CRISP)

```text
CONTEXT
We are about to test <feature_name> on <url>.
Project context: {{paste context.project.md}}
Requirement:
<requirement_text>

ROLE
Act as a QA Lead reviewing requirements before test design.

INSTRUCTION
Review the requirement and find anything that could cause missed or wrong test cases.

SPECIFICS
- List ambiguities, missing details, conflicting statements and untestable statements.
- List missing rules such as limits, error messages, permissions, and behaviour for guest vs logged-in users.
- For each gap, write one clear question for the Product Owner or developer.
- Do not invent answers. Mark them as "Needs confirmation".

PERSONA / PARAMETERS
- Tone: constructive and brief.
- Format: table with columns Gap | Why it matters | Question to ask | Risk (High/Medium/Low)
- Maximum <n> items.
```

---

## Step 2: Test Case Generation (RICE POT)

```text
ROLE
You are a Senior QA Engineer with <years> years of experience in <domain> testing.

INSTRUCTIONS
Create test cases from the requirement below.
1. Break the requirement into testable conditions first.
2. Cover positive, negative, boundary and edge scenarios.
3. Apply equivalence partitioning, boundary value analysis and decision tables where they fit.
4. Map every test case to an acceptance criterion (AC1, AC2, ...).
5. Mark scenarios that depend on unanswered questions as "Pending confirmation".
6. End with a traceability summary and a list of assumptions.

CONTEXT
Requirement: <requirement_text>
Feature:     {{paste context.feature.md}}
Testing:     {{paste context.testing.md}}
Constraints: {{paste context.constraints.md}}
Application URL: <url>

EXAMPLE
TC_CART_001 | Verify a product can be added to the cart from the product page | Positive | P1 | AC1
Preconditions: Product is in stock, user is on <url>
Steps: 1. Open the product page. 2. Click "Add to Cart".
Expected: Cart count increases by 1 and the product appears in the cart with the correct price.

PARAMETERS
- Number of test cases: <n>
- Priorities: P1 to P4
- Types: <positive | negative | boundary | edge>
- Platforms: <browser_list>, <device_list>
- ID format: TC_<MODULE>_<NNN>

OUTPUT
1. Testable conditions list
2. Markdown table: Test Case ID | Title | Type | Priority | AC Mapping | Preconditions | Test Data | Steps | Expected Result
3. Traceability table: AC | Test Case IDs
4. Assumptions and open questions

TONE
Professional, precise, no filler.
```

---

## Step 3: Self-review (CLEAR)

Run this after generation to improve quality.

```text
Review the test cases you just wrote.
Concise:    remove duplicates and wordy steps.
Logical:    reorder from happy path to edge cases.
Explicit:   make sure each case has one expected result and exact test data.
Adaptive:   mark cases that need changes if answers to the open questions differ.
Reflective: list 5 scenarios that are still not covered and why.
Return only the corrected table and the list of 5 scenarios.
```

---

## Quality Checklist for the Output
- [ ] Every acceptance criterion has at least one test case
- [ ] Positive, negative, boundary and edge cases are present
- [ ] Each test case has one clear expected result
- [ ] No hard-coded URLs, credentials or personal data (placeholders used)
- [ ] Open questions are listed, not guessed
- [ ] IDs follow `TC_<MODULE>_<NNN>`