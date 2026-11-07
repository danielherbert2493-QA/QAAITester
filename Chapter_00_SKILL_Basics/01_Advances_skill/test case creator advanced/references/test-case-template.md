# Test Case Template

Reference for `advance-testcase-creator`. Fill one block per test case. Do not leave fields blank: write "N/A" if a field does not apply, or raise it as a gap if the ticket does not give enough information.

---

## Field Definitions

| Field | Rules |
|---|---|
| **TC ID** | Format `TC-<KEY>-<3 digits>`, e.g. `TC-ECOM-101-001`. Unique and sequential. |
| **Title** | Action + expected outcome, under 100 characters. e.g. "Cancel express payment sheet returns to cart with items intact". |
| **Linked AC / Gap** | The AC number(s) or gap ID(s) this case covers, e.g. `AC-3`, `GAP-2`. A case with no link should not exist. |
| **Technique** | EP / BVA / Decision Table / State Transition / Scenario / Pairwise / Role Matrix / Error Guessing. |
| **Type** | Functional / Negative / Boundary / UI / Security / Accessibility / Performance / Compatibility / Regression. |
| **Priority** | **P0** = blocks release, core flow, money or data at risk. **P1** = important feature, common path. **P2** = edge case, low impact. |
| **Preconditions** | State that must be true before step 1 (user type, data, config, environment). |
| **Test Data** | Exact values to use. Use clearly fake data. No real customer data or credentials. |
| **Steps** | Numbered, atomic, one action per step, reproducible by someone who has not read the ticket. |
| **Expected Result** | Specific and observable: what the user sees, which data changes, what is not changed. Not "works correctly". |
| **Postconditions** | State after the test, and any cleanup needed. |
| **Automation Candidate** | Yes / No / Later, with a one-line reason. Do not write automation. |
| **Status** | Draft / Blocked – needs clarification / Ready for review. Never "Approved" or "Final". |
| **Notes** | Assumptions, open questions, links to defects. |

---

## Test Case Block (copy for each case)

```markdown
### TC-<KEY>-001: <Title>

| Field | Value |
|---|---|
| Linked AC / Gap | AC-_ / GAP-_ |
| Technique | |
| Type | |
| Priority | P0 / P1 / P2 |
| Automation Candidate | Yes / No / Later: <reason> |
| Status | Draft |

**Preconditions**
- 

**Test Data**
- 

**Steps**
1. 
2. 
3. 

**Expected Result**
- 

**Postconditions / Cleanup**
- 

**Notes**
- 
```

---

## Filled Example

### TC-ECOM-101-004: Cancelling the express payment sheet returns to cart unchanged

| Field | Value |
|---|---|
| Linked AC / Gap | AC-5 |
| Technique | Scenario (exception flow) |
| Type | Negative |
| Priority | P1 |
| Automation Candidate | Later: depends on a stable wallet sandbox |
| Status | Draft |

**Preconditions**
- Guest shopper, not logged in
- Cart contains 1 in-stock item, quantity 1
- Express payment provider is enabled in the test environment

**Test Data**
- Item: any in-stock test product
- Provider: any express payment option shown on the cart page

**Steps**
1. Open the Cart page.
2. Click the express payment button.
3. When the provider's payment sheet opens, close or cancel it without authorizing.

**Expected Result**
- The shopper is returned to the Cart page.
- The cart still contains the same item and quantity, and the same totals.
- No order is created and no payment is taken.
- No error message is shown (or the message matches what the AC defines).

**Postconditions / Cleanup**
- Empty the cart.

**Notes**
- The AC does not say whether a message should appear on cancel. See GAP-3.

---

## Blocked Test Case Example

Use this form when the ticket does not define the behaviour.

### TC-ECOM-101-012: Behaviour when shipping address is outside serviceable regions

| Field | Value |
|---|---|
| Linked AC / Gap | GAP-5 |
| Status | **Blocked – needs clarification** |

**Question for author:** What should the shopper see when the address is not serviceable, and can the order still be placed?

**Draft steps (expected result unknown):**
1. Start express payment with an address outside the serviceable regions.
2. Observe the behaviour.

**Expected Result:** TBD pending answer from the ticket author. Do not guess.

---

## Traceability Matrix Template

| AC / Gap | Description (short) | Test Case IDs | Coverage |
|---|---|---|---|
| AC-1 | | | Covered / Partial / **Hole** |
| AC-2 | | | |
| GAP-1 | | | Blocked |

Flag every AC with no test case as a **Hole**, and say why (missing info, out of scope, or oversight).

---

## Summary Table Template

| TC ID | Title | AC / Gap | Type | Priority | Status |
|---|---|---|---|---|---|
| | | | | | |

Include totals: number of cases by priority (P0 / P1 / P2) and by status (Draft / Blocked).

---

## Quality Checklist (before presenting)

- [ ] Every test case links to an AC or a gap
- [ ] Every title says the action and the outcome
- [ ] Steps are atomic and numbered
- [ ] Expected results are specific and observable
- [ ] Test data is explicit and fake
- [ ] No two test cases verify the same thing
- [ ] Priorities are assigned by risk
- [ ] Undefined behaviour is marked Blocked, not guessed
- [ ] The traceability matrix shows no unexplained holes
- [ ] The Human Review Gate is included, and nothing is marked final