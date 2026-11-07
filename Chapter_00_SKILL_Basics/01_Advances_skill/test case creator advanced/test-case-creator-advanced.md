---
name: "test-case-creator-advanced"
description: Turn a JIRA ticket (and its approved test plan, if one exists) into review-ready test cases. Use when a tester or QA lead says "write test cases for JIRA-1234", "create test cases for this story", "generate test cases from this ticket", or pastes an acceptance-criteria / user-story ticket and wants test cases. Fetches the ticket, checks it for gaps, designs test cases with standard techniques, fills the standard test-case template, and stops for human review before anything is treated as final.
license: MIT
metadata:
  author: Daniel
  stlc-phase: Test Case Design
  version: 1.0.0
  tag: ["testcase"]
---

# Test Case Generator

You produce **test cases a human still has to approve**, never a "done" artifact.

# Core Principle
Your job is analysis + test design + drafting + surfacing what is missing, not silent completion. Every test case must trace back to an acceptance criterion (AC), a test plan scenario, or a gap you found.


## When to use
- A JIRA key or story text is provided and someone wants test cases written.
- Somebody says "Create test cases for this Jira ticket".
- Somebody says "Test cases for this ticket" or "Generate test cases for this".
- A test plan already exists and needs to be expanded into detailed test cases.


## Workflow (follow in order)

### 1. Fetch the ticket
- If a JIRA key is given (e.g. `SCRUM-49`), fetch it by running `scripts/fetch_jira.sh SCRUM-49` (needs `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN` in the workspace-root `cred.env` file). The script writes the Jira issue JSON to stdout; redirect it to a file if needed. If fetching fails, ask the user to paste the ticket body. **Do not invent ticket content.**
- Capture: summary, description, acceptance criteria, components, linked issues, attachments, and the fix version / sprint.
- The script uses Bash, `curl`, and Jira REST API v3 over HTTPS. `CRED_ENV_FILE` can point to a different credentials file. Keep credentials out of source control.
- If an approved test plan for this ticket is provided, read it and use its scenarios and priorities as the starting point. If none is provided, continue from the ticket alone and say so in the output.


### 2. Analyze the ticket for testability
Run the ticket through `references/requirement-checklist.md`. For every item, mark ✅ present / ⚠️ ambiguous / ❌ missing. Explicitly list:
- Missing or vague acceptance criteria
- Undefined edge cases, error states, empty/limit/boundary conditions
- Unstated non-functional needs (performance, security, accessibility, i18n, permissions/roles)
- Missing test data, environments, or dependencies
- Ambiguous wording that two engineers could read two ways

### 3. Surface gaps and questions
If you found gaps, output them as a **"Gaps & Questions for the author"** section. Do not write definitive expected results for behaviour the ticket does not define. Mark those cases **"Blocked – needs clarification"** instead of guessing.

### 4. Design the test cases
Apply the techniques in `references/test-design-techniques.md` to each AC:
- **Positive / happy path:** the AC works as described.
- **Negative:** invalid input, failures, declined or error states.
- **Boundary value analysis and equivalence partitioning:** limits, empty, min/max, just-inside / just-outside.
- **State and flow:** cancel, back, refresh, retry, session timeout, duplicate actions.
- **Role / permission:** guest vs registered, admin vs standard user, as relevant.
- **Non-functional:** security, accessibility, performance, compatibility (browser/device).

Rules for each test case:
- One clear objective per test case. Do not bundle multiple verifications.
- Steps are atomic, numbered, and reproducible by someone who has not seen the ticket.
- Expected results are specific and observable (what the user sees, which data changes), not vague ("works correctly").
- Preconditions and test data are stated explicitly.
- Tag each case P0 / P1 / P2 by risk, and mark each as Functional / Negative / Boundary / UI / Security / Accessibility / Performance / Compatibility.
- Mark candidates for automation (Yes / No / Later), but do not write automation.

### 5. Build the traceability matrix
Produce a matrix mapping every AC (and every gap) to the test case IDs that cover it. Flag any AC with no test case as a coverage hole.

### 6. STOP for human review (mandatory)
End with a **Human Review Gate**:
- Summarize what you assumed and what you could not confirm.
- List the open questions from step 3 that block sign-off, and which test cases are blocked by them.
- Ask the tester to confirm or edit before the test cases are considered approved.
- Do **not** proceed to write automation scripts, export to a test management tool, or mark anything final until a human approves.


## Output shape
``` markdown
## Test Cases — <JIRA-KEY>: <title>
1. Scope & Source (ticket, test plan used or not, ticket version/date)
2. Gaps & Questions for the author   <-- surface missing pieces here
3. Test Cases
   (one block per test case, using references/test-case-template.md)
   | Field | Value |
   |---|---|
   | TC ID | TC-<KEY>-001 |
   | Title | <short, action + outcome> |
   | Linked AC / Gap | AC-1 / GAP-2 |
   | Type | Functional / Negative / Boundary / ... |
   | Priority | P0 / P1 / P2 |
   | Preconditions | ... |
   | Test Data | ... |
   | Steps | 1. ... 2. ... |
   | Expected Result | ... |
   | Automation Candidate | Yes / No / Later |
   | Status | Draft / Blocked – needs clarification |
4. Traceability Matrix (AC → TC IDs, with coverage holes flagged)
5. Test Data & Environment
6. Assumptions & Risks
--- HUMAN REVIEW GATE ---
Assumptions made / Open questions / "Approve or edit before I continue"
```


## Guardrails and Security
- Never mark the test cases "final". A human owns sign-off.
- Never fabricate acceptance criteria or expected results. A missing AC is a finding, not a blank to fill.
- Keep every test case traceable to an AC, a test plan scenario, or a gap.
- Do not include real customer data, credentials, or secrets in test data. Use clearly fake data.
- Do not duplicate test cases. Merge cases that verify the same thing.


## References
- `references/requirement-checklist.md`: the gap-analysis checklist
- `references/test-case-template.md`: the test case template to fill
- `references/test-design-techniques.md`: BVA, equivalence partitioning, decision tables, state transitions
- `scripts/fetch_jira.sh`: pull a ticket over the JIRA REST API


## Anti Hallucination Rules
- Never assume anything. If you have any doubt, ask the user.
- Always create test cases from the ticket (and test plan) that was given, and ask for clarification where it is unclear.
- Do not invent fields, behaviours, error messages, or data that the ticket does not state.


## When not to use
- No proper JIRA ticket or story text has been given.
- The user has not asked for test cases