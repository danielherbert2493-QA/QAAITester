# Test Design Techniques

Reference for `advance-testcase-creator`. For each acceptance criterion (AC), pick the techniques that fit, then write test cases from them. Do not apply every technique to every AC; use judgement and state which technique produced each case.

---

## How to choose a technique

| If the AC involves... | Use |
|---|---|
| Ranges, limits, counts, lengths, amounts, dates | Boundary Value Analysis |
| Inputs that fall into groups that behave the same | Equivalence Partitioning |
| Several conditions combining to give different outcomes | Decision Table |
| Statuses or a lifecycle (e.g. cart, order, payment) | State Transition |
| A user journey across screens or systems | Use Case / Scenario Testing |
| Many parameters with many values | Pairwise (Combinatorial) |
| Vague or high-risk areas, or no clear spec | Error Guessing / Exploratory |
| Different user types or access levels | Role / Permission Matrix |

---

## 1. Equivalence Partitioning (EP)

**Idea:** Split inputs into groups (partitions) where the system should behave the same for every value. Test one representative value from each partition instead of every value.

**Steps:**
1. List the input and its rule from the AC.
2. Identify valid partitions and invalid partitions.
3. Pick one value from each partition.

**Example:** Quantity field accepts 1 to 10.

| Partition | Representative value | Expected |
|---|---|---|
| Below range (invalid) | 0 | Rejected, error shown |
| Within range (valid) | 5 | Accepted |
| Above range (invalid) | 11 | Rejected, error shown |
| Non-numeric (invalid) | "abc" | Rejected, error shown |
| Empty (invalid) | (blank) | Rejected or default applied, per AC |

---

## 2. Boundary Value Analysis (BVA)

**Idea:** Bugs cluster at the edges. Test the values at, just below, and just above each boundary.

**Steps:**
1. Find each boundary in the AC.
2. Test: min-1, min, min+1, max-1, max, max+1.

**Example:** Quantity accepts 1 to 10.

| Value | Position | Expected |
|---|---|---|
| 0 | Just below min | Rejected |
| 1 | Min | Accepted |
| 2 | Just above min | Accepted |
| 9 | Just below max | Accepted |
| 10 | Max | Accepted |
| 11 | Just above max | Rejected |

**Also apply to:** string lengths, file sizes, order totals, date ranges, number of items in a cart, free-shipping thresholds, session timeouts.

---

## 3. Decision Table Testing

**Idea:** When the outcome depends on a combination of conditions, list all combinations and the expected action for each.

**Steps:**
1. List conditions and possible actions.
2. Build a table of condition combinations (rules).
3. Remove impossible combinations and merge duplicates.
4. Write one test case per rule.

**Example:** Free shipping rule.

| Rule | Order total ≥ threshold | Member | Promo code applied | Expected shipping |
|---|---|---|---|---|
| 1 | Yes | Yes | No | Free |
| 2 | Yes | No | No | Free |
| 3 | No | Yes | No | Per member rate (confirm with AC) |
| 4 | No | No | No | Standard charge |
| 5 | No | No | Free-shipping promo | Free |

If the AC does not define a rule, record it as a gap instead of guessing the result.

---

## 4. State Transition Testing

**Idea:** Model the object's states and the events that move it between them. Test valid transitions, and attempt invalid ones.

**Steps:**
1. List states and events.
2. Draw or tabulate the transitions.
3. Test each valid transition, each invalid transition, and sequences of transitions.

**Example:** Order status.

| From | Event | To | Valid? |
|---|---|---|---|
| Cart | Place order | Pending payment | Yes |
| Pending payment | Payment success | Confirmed | Yes |
| Pending payment | Payment fails | Payment failed | Yes |
| Confirmed | Cancel | Cancelled | Yes (if allowed by AC) |
| Cancelled | Ship | Shipped | No, should be blocked |
| Shipped | Cancel | Cancelled | Check AC |

**Also test:** repeating an event (double click), event out of order, event after timeout, refresh or back button mid-transition.

---

## 5. Use Case / Scenario Testing

**Idea:** Test complete end-to-end user journeys, including main flow, alternate flows, and exception flows.

**Steps:**
1. Identify the actor and goal.
2. Write the main (happy) flow.
3. Add alternate flows (different valid routes) and exception flows (things going wrong).
4. Turn each flow into a test case.

**Example:** Guest completes a purchase.
- Main: add item, go to cart, proceed, pay, see confirmation.
- Alternate: apply promo code before paying.
- Exception: payment declined, item goes out of stock, session expires.

---

## 6. Pairwise (Combinatorial) Testing

**Idea:** Most defects are caused by the interaction of two parameters. Cover every pair of values at least once instead of every full combination.

**Use when:** many parameters (browser, device, user type, payment method, language) make full combinations too large.

**Example:** 3 browsers × 3 devices × 3 payment methods = 27 full combinations. A pairwise set can cover every pair in about 9 cases.

**Tip:** Use a pairwise tool (for example PICT or an online generator) and record the parameter list in the test case.

---

## 7. Role / Permission Matrix

**Idea:** Verify each user type can do what they should, and cannot do what they should not.

| Action | Guest | Registered | Admin |
|---|---|---|---|
| View page | Allowed | Allowed | Allowed |
| Perform action X | (per AC) | (per AC) | (per AC) |
| Access restricted page | Blocked | Blocked | Allowed |

Write at least one positive and one negative test per role for each protected action. If roles are not defined in the ticket, raise it as a gap.

---

## 8. Error Guessing

**Idea:** Use experience to guess where defects hide. Good for finding what the spec forgot.

**Common checklist:**
- Empty, null, whitespace-only input
- Very long input, special characters, emojis, SQL/HTML characters
- Negative numbers, zero, decimals where integers are expected
- Duplicate submissions, double click, rapid repeated actions
- Back, forward, refresh during a process
- Session timeout or logout mid-flow
- Slow network, lost connection, interrupted request
- Same action in two tabs or two devices at once
- Time zone, daylight saving, leap-year dates
- Different locales, currencies, and languages
- Data that changes mid-flow (price, stock, promotion)

---

## 9. Non-Functional Test Ideas

Only add these when the ticket or company standards (`misc/mycompanydetails.md`) call for it, and state any assumed targets as open questions.

| Area | What to check |
|---|---|
| Security | Input validation, authorization, data exposure, HTTPS, token reuse |
| Accessibility | Keyboard navigation, screen reader labels, colour contrast, focus order |
| Performance | Load time, response time under expected load |
| Compatibility | Supported browsers, devices, OS versions, screen sizes |
| Usability | Clear messages, consistent labels, recoverable errors |
| Localization | Language, currency, date and number formats |

---

## Writing the test case from a technique

For each case, record:
- **Technique used** (EP, BVA, Decision Table, State, Scenario, Pairwise, Role, Error Guessing)
- **Linked AC or gap**
- **Specific input values** (not "a valid value")
- **Observable expected result**

**Good:** "Enter quantity 11. Error 'Maximum quantity is 10' is displayed and the cart is not updated."
**Weak:** "Enter an invalid quantity. System handles it properly."

---

## Quick coverage check before finishing

- [ ] Every AC has at least one positive and one negative case
- [ ] Every boundary has been tested at the edges
- [ ] Every state transition and invalid transition is covered
- [ ] Every role and permission is covered
- [ ] Duplicate, cancel, refresh, and timeout cases are considered
- [ ] Undefined behaviour is raised as a gap, not guessed
- [ ] No two test cases verify the same thing
