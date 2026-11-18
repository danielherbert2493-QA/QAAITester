## Test Strategy
- **Levels:** Functional, Regression, Smoke, Integration (UI + API), basic Exploratory
- **Non-functional (only when asked):** Usability, Compatibility, Performance (basic), Accessibility (basic)
- **Techniques to apply:** Equivalence partitioning, Boundary value analysis, Decision table, State transition, Error guessing

## Test Environment
- **URL:** <url>
- **Build / version:** <build_version>
- **Browsers and devices:** <browser_list>, <device_list>
- **Test accounts:** `<test_user_email>` / `<test_user_password>` (never real credentials)
- **Test data:** <test_data_description>  (example: products in categories Electronics, Books, Fashion)

## Test Case Template
| Field | Description |
|-------|-------------|
| Test Case ID | TC_<MODULE>_<NNN> |
| Title | Short, starts with "Verify" |
| Module / Feature | <feature_name> |
| Type | Positive / Negative / Boundary / Edge |
| Priority | P1 to P4 |
| Preconditions | State needed before the test |
| Test Data | Exact inputs |
| Steps | Numbered, one action each |
| Expected Result | Observable outcome |

## Defect Report Template
| Field | Description |
|-------|-------------|
| Bug ID | <bug_id> |
| Title | <component> - short description of the problem |
| Environment | <url>, <build_version>, browser, device |
| Steps to Reproduce | Numbered steps |
| Actual Result | What happened |
| Expected Result | What should happen |
| Severity | Blocker / Critical / Major / Minor / Trivial |
| Priority | P1 to P4 |
| Evidence | Screenshot, video, console log, network log |

## Severity Guide
- **Blocker:** feature unusable, no workaround (example: cannot place any order)
- **Critical:** major function broken, risky workaround
- **Major:** function partly broken, workaround exists
- **Minor:** small functional or UI issue
- **Trivial:** cosmetic

## Entry and Exit Criteria
- **Entry:** build deployed, test data ready, requirements reviewed
- **Exit:** all P1 and P2 cases executed, no open Blocker or Critical defects, results reported