Daily smoke suite validation. Run after every deployment or at the start of the day.
Example application: Amazon e-commerce (learning). Replace values with your own.

- **Application URL:** <url>
- **Environment:** <environment>
- **Build / version:** <build_version>
- **Tester:** <name>
- **Date:** <date>
- **Browser / device:** <browser>, <device>

> Safety: no real purchases or payments. Stop at the payment step. Use `<test_user_email>` / `<test_user_password>` only.

## Smoke Checklist (critical path, target: under <n> minutes)

| ID | Area | Check | Expected | Status (Pass/Fail/Blocked) | Notes / Bug ID |
|----|------|-------|----------|----------------------------|----------------|
| SM_01 | Home page | Open <url> | Page loads, header, search bar and banners visible, no console errors | | |
| SM_02 | Search | Search for `<valid_keyword>` | Relevant results shown with image, title, price | | |
| SM_03 | Search | Search for `<invalid_keyword>` | "No results" message, page does not break | | |
| SM_04 | Filters / sort | Apply one filter and one sort | Results update correctly | | |
| SM_05 | Product page | Open a product from results | Title, price, images, availability and "Add to Cart" visible | | |
| SM_06 | Cart | Add product to cart | Cart count increases, item and price correct | | |
| SM_07 | Cart | Change quantity, then remove item | Totals update, item removed | | |
| SM_08 | Login | Log in with test account | Lands on logged-in home page with user name shown | | |
| SM_09 | Login | Log in with wrong password | Clear error message, no login | | |
| SM_10 | Checkout | Proceed from cart to checkout | Address and delivery options page opens | | |
| SM_11 | Checkout | Continue to payment step | Payment options visible. STOP here, do not pay | | |
| SM_12 | Orders | Open "Your Orders" page | Order list or empty state loads | | |
| SM_13 | Logout | Log out | Session ends, returns to guest view | | |
| SM_14 | Compatibility | Repeat SM_01 and SM_02 on <second_browser_or_device> | Same behaviour | | |

## Go / No-Go Rule
- **Go:** all P1 checks (SM_01, 02, 05, 06, 08, 10, 11) pass.
- **No-Go:** any P1 check fails. Stop testing, raise a Blocker, inform <owner>.
- **Go with risk:** only non-P1 checks fail. Log bugs and note them in the status update.

## Daily Result Summary

| Total | Passed | Failed | Blocked | Pass % |
|-------|--------|--------|---------|--------|
| <total> | <passed> | <failed> | <blocked> | <pass_percent> |

**Decision:** <Go | No-Go | Go with risk>
**Bugs raised:** <bug_ids>

---

## Prompt: Smoke Result Validation (STAR)

```text
SITUATION
We ran the daily smoke suite on <url> for build <build_version> in <environment>.
Total: <total>. Passed: <passed>. Failed: <failed>. Blocked: <blocked>.
Results / failure notes:
<paste_filled_checklist_or_logs>

TASK
Validate the smoke results and decide whether the build is stable enough for further testing.

ACTION
1. Confirm the pass rate and list every failed or blocked check.
2. For each failure, give probable cause (product defect, test data, environment, script issue, flaky), confidence (High/Medium/Low) and next step.
3. Flag any failure that affects a P1 check as a blocker.
4. Point out anything that looks inconsistent or missing in the results.
5. If evidence is not enough, write "needs investigation" instead of guessing.

RESULT
Return:
- Go / No-Go / Go with risk, with a 2-line reason
- Table: Check ID | Area | Probable Cause | Confidence | Next Step | Blocker (Y/N)
- Draft bug titles for confirmed defects
- A 5-line update for the team channel
```