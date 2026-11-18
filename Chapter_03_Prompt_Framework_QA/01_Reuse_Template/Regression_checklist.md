Regression checklist by module, plus a prompt to choose the right scope for each release.
Example application: Amazon e-commerce (learning). Replace values with your own.

- **Application URL:** <url>
- **Release / build:** <build_version>
- **Environment:** <environment>
- **Change summary:** <what_changed_in_this_release>
- **Tester:** <name>
- **Date:** <date>

> Safety: no real purchases or payments. Use test accounts only.

## How to use
1. Mark which modules are **impacted** by the release (direct change or dependency).
2. Run all **P1** items for every module, and P2/P3 items for impacted modules.
3. Record Pass / Fail / Blocked and the bug ID.

## Regression Checklist

### 1. Search and Listing
| ID | Pri | Check | Expected | Status | Bug ID |
|----|-----|-------|----------|--------|--------|
| RG_SRCH_01 | P1 | Search with a valid keyword | Relevant results shown | | |
| RG_SRCH_02 | P2 | Auto-suggestions while typing | Suggestions appear and are clickable | | |
| RG_SRCH_03 | P2 | Search with special characters / very long text | No crash, sensible result or message | | |
| RG_SRCH_04 | P2 | Filters (category, brand, price, rating) alone and combined | Results match filters | | |
| RG_SRCH_05 | P2 | Sort by price, rating, relevance | Order is correct | | |
| RG_SRCH_06 | P3 | Pagination / load more | Next results load, no duplicates | | |

### 2. Product Detail Page
| ID | Pri | Check | Expected | Status | Bug ID |
|----|-----|-------|----------|--------|--------|
| RG_PDP_01 | P1 | Price, title, image and availability display | Correct and consistent with listing | | |
| RG_PDP_02 | P2 | Variant selection (size, colour) | Price and image update | | |
| RG_PDP_03 | P2 | Out-of-stock product | "Add to Cart" disabled, message shown | | |
| RG_PDP_04 | P3 | Reviews and ratings section | Loads, counts match | | |

### 3. Cart and Wishlist
| ID | Pri | Check | Expected | Status | Bug ID |
|----|-----|-------|----------|--------|--------|
| RG_CART_01 | P1 | Add, update quantity, remove | Totals recalculate correctly | | |
| RG_CART_02 | P2 | Cart persists after refresh and re-login | Items retained | | |
| RG_CART_03 | P2 | Apply valid and invalid coupon | Discount applied or clear error | | |
| RG_CART_04 | P3 | Move item to wishlist / save for later | Item moves, cart updates | | |

### 4. Checkout (stop before payment)
| ID | Pri | Check | Expected | Status | Bug ID |
|----|-----|-------|----------|--------|--------|
| RG_CHK_01 | P1 | Reach checkout from cart | Address and delivery step opens | | |
| RG_CHK_02 | P1 | Add / change delivery address with valid and invalid pin code | Valid accepted, invalid rejected with message | | |
| RG_CHK_03 | P2 | Delivery options and charges | Shown correctly for the address | | |
| RG_CHK_04 | P1 | Payment options visible. STOP before paying | All expected options listed | | |

### 5. Login and Account
| ID | Pri | Check | Expected | Status | Bug ID |
|----|-----|-------|----------|--------|--------|
| RG_ACC_01 | P1 | Login with valid credentials | Success | | |
| RG_ACC_02 | P1 | Login with invalid credentials | Error shown, no access | | |
| RG_ACC_03 | P2 | Forgot password flow starts | Reset option works up to the verification step | | |
| RG_ACC_04 | P2 | Update profile / address | Changes saved | | |
| RG_ACC_05 | P1 | Logout | Session ends | | |

### 6. Orders and Returns
| ID | Pri | Check | Expected | Status | Bug ID |
|----|-----|-------|----------|--------|--------|
| RG_ORD_01 | P2 | "Your Orders" page | List or empty state loads | | |
| RG_ORD_02 | P2 | Order details and tracking view | Details match order | | |
| RG_ORD_03 | P3 | Return / cancel option visibility rules | Shown only when eligible | | |

### 7. Cross-cutting
| ID | Pri | Check | Expected | Status | Bug ID |
|----|-----|-------|----------|--------|--------|
| RG_X_01 | P2 | Key flows on <second_browser> and <mobile_device> | Same behaviour | | |
| RG_X_02 | P3 | Responsive layout at <screen_width> | No overlap or hidden controls | | |
| RG_X_03 | P3 | Page load time for home and search | Within <n> seconds | | |
| RG_X_04 | P3 | Basic accessibility: keyboard tab order, image alt text | Usable without a mouse | | |

## Summary

| Module | Impacted (Y/N) | Executed | Passed | Failed | Blocked |
|--------|----------------|----------|--------|--------|---------|
| Search and Listing | | | | | |
| Product Detail Page | | | | | |
| Cart and Wishlist | | | | | |
| Checkout | | | | | |
| Login and Account | | | | | |
| Orders and Returns | | | | | |
| Cross-cutting | | | | | |

**Release recommendation:** <Go | No-Go | Go with risk>

---

## Prompt: Regression Scope Selection (CLEAR)

```text
Concise:
Choose the regression scope for build <build_version> of <url>.

Logical:
Step 1: Read the change summary below and list the modules directly changed.
Step 2: List modules that depend on them (indirect impact).
Step 3: From the checklist, select which items to run, ordered by priority.
Step 4: Estimate effort in hours per module.

Explicit:
Change summary: <what_changed_in_this_release>
Checklist: {{paste checklist.regression.md}}
Time available: <hours> hours. Testers: <n>.
Rules: always include every P1 item. Do not remove items for modules marked impacted.
Output: a table with Module | Impact (Direct / Indirect / None) | Items to run | Reason | Estimated hours, then a one-paragraph risk note.

Adaptive:
If the change summary is unclear, list the questions you need answered instead of guessing.
If time is too short for all P1 items, say what to drop first and what risk that adds.

Reflective:
End with 3 areas that are not in the checklist but could be affected by this change.
```

---

## Prompt: Regression Result Analysis (STAR)

```text
SITUATION
Regression for <url>, build <build_version> finished.
Executed: <executed>. Passed: <passed>. Failed: <failed>. Blocked: <blocked>.
Filled checklist / logs: <paste_results>

TASK
Decide whether the release can go ahead.

ACTION
Group failures by module and probable cause (defect, data, environment, script, flaky).
Mark release blockers using the Severity Guide in context.testing.md.
Compare with the previous run if data is provided: <previous_results>.
Say "needs investigation" where evidence is not enough.

RESULT
Go / No-Go / Go with risk with a 3-line reason, a failure table (ID | Module | Cause | Confidence | Next step | Blocker Y/N), defects to raise, and a 6-line release note for the team.
```