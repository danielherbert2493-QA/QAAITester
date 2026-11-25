1. Overview
This strategy sets how quality is assured for the E-Commerce Platform defined in the PRD. It is a long-lived document: it changes when the product, risk profile or tooling changes, not per release. Section numbers match the PRD.
Field
Value
Product / PRD version
[Product name] / [PRD version]
Strategy version and date
[1.0] / [date]
Author / approver
[QA owner] / [Product owner]
Test objectives
Verify every Must requirement; find defects early; confirm performance, security and agent safety targets; give a go/no-go signal for each release
2. Quality Goals and Metrics
Goals come from PRD section 2. Fill the current value each cycle.
Metric
Target
Source
Requirement coverage (Must)
100% mapped to at least one test case
Traceability matrix
Test pass rate at release
≥ 95%, with 100% of Must / P1 cases passing
Test management tool
Defect leakage to production
≤ 5% of total defects
Defect tracker
Open Sev-1 / Sev-2 at release
0 / ≤ 3
Defect tracker
Automated regression share
≥ 70% of regression cases
Automation report
Agent accuracy / safety pass
≥ 90% / 100%
Agent evaluation run
Performance (LCP p75, API p95)
≤ 2.5 s / ≤ 500 ms
Load and web-vitals reports
3. Scope
In testing scope: all items in PRD section 3 "In scope", the admin console, integrations (INT-001 to INT-009), and the AI agent.
Out of testing scope: native apps, marketplace and subscriptions (PRD out of scope); production payment capture with real cards; third-party provider internals.
Assumptions: stable sandbox for each provider; production-like data available in staging. Constraints: shared staging environment, provider sandbox rate limits, agent responses are non-deterministic.
4. Test Levels, Types and Roles
Level / type
Purpose
Owner
Automation
Unit
Business rules: pricing, tax, promotions, stock
Developers
100% automated
API / contract
Service and integration behaviour (INT-001 to INT-009)
QA + developers
Automated (Postman/REST Assured or similar)
UI functional
End-to-end flows per persona (P-01 to P-06)
QA
Core flows automated (Playwright), rest manual
Exploratory
Usability, edge cases, new features
QA
Manual, time-boxed sessions
Regression
Protect existing behaviour each release
QA
Automated, run nightly and on release
Smoke / sanity
Is the build testable and are critical paths up
QA
Automated on every deployment
UAT
Business acceptance
Product owner, business users
Manual
Roles: QA lead (strategy, sign-off), QA engineers (design, execution, automation), developers (unit tests, defect fixes), product owner (acceptance, priority), DevOps (environments, pipelines), security specialist (penetration test).
5. Test Approach per Functional Module
Techniques: equivalence partitioning, boundary values, decision tables for promotions and tax, state transition for orders and returns, pairwise for variant and filter combinations, and risk-based prioritization.
PRD module
Risk
Focus
Depth
5.1 Catalog (CAT)
Medium
Variant logic, stock display, review rules
Full functional, light exploratory
5.2 Search (SRC)
Medium
Relevance, filters, typo tolerance, empty results
Data-driven, automated queries
5.3 Cart (CRT)
High
Totals, persistence, price and stock re-validation
Full, automated
5.4 Checkout (CHK)
Critical
Step validation, totals to the cent, serviceability
Full, automated, cross-browser
5.5 Payments (PAY)
Critical
Every method, failure paths, 3DS, idempotency, reconciliation
Full, sandbox + negative
5.6 Orders (ORD)
High
Status transitions, cancellation, concurrent stock
Full, state-transition
5.7 Returns (RET)
High
Window rules, partial refund maths
Full, decision tables
5.8 Account (ACC)
High
Login, lockout, reset, data isolation
Full, with security cases
5.9 Promotions (PRM)
High
Stacking, limits, expiry, rounding
Decision tables, boundary
5.10 Admin (ADM)
High
RBAC, bulk import, audit log
Full, role matrix
5.11 Notifications (NTF)
Medium
Trigger, content, once-only, opt-out
API + mailbox checks
6. AI Agent Testing Strategy
Agent responses vary between runs, so tests check properties of the answer, not exact wording. Each scenario is run at least 3 times; a scenario passes only if it passes every run (safety) or at least 2 of 3 runs (quality).
Dimension
What is checked
Method
Accuracy
Facts (price, stock, order status, policy) equal the source of truth
Compare with catalog/order API and the approved knowledge base
Groundedness
No invented products, policies or links; says "I don't know" when no source exists
Scenario set with unanswerable questions
Safety and security
Prompt injection, data of other users, price override, jailbreak, harmful content
Adversarial scenario set, 100% must pass
Actions
Add to cart, return request and coupon require confirmation and match the UI result
End-to-end checks via UI/API after the action
Escalation
Hand-off triggers and context transfer
Scripted triggers, check ticket content
Conversation quality
Context, clarifying questions, tone, brevity, language
Rubric scored 1 to 5 by two reviewers; average ≥ 4
Robustness
Typos, slang, mixed languages, very long input, rapid retries
Perturbed versions of core scenarios
Performance
First response time at p90, behaviour when the LLM is down
Timing and fault injection
Regression
Re-run the full set when the model, prompt or knowledge base changes
Evaluation harness, results compared to previous run
A scenario set is versioned with the PRD: each scenario links to FR-AGT and SEC-009 IDs. Scoring uses an expected-behaviour description plus pass/fail checks, defined in the Test Case template, section 6.
7. Non-Functional Testing Strategy
NFR area
Approach
Tools (examples)
Frequency
Performance and load (NFR-PERF)
Baseline, load to 5,000 users, spike and 2-hour soak on search, cart, checkout
JMeter, k6, Lighthouse
Each release; before sales events
Availability and recovery (NFR-AVL, REL)
Failover and backup restore drill
Environment scripts
Quarterly
Scalability (NFR-SCL)
Autoscale check under ramp-up
k6 plus cloud metrics
Each release
Usability (NFR-USB)
Task-based sessions with 5 first-time users
Moderated sessions
Major releases
Accessibility (NFR-ACC)
Automated scan plus keyboard and screen-reader checks
axe, NVDA, VoiceOver
Each release
Compatibility (NFR-CMP)
Browser and device matrix
BrowserStack or similar
Each release
Localization (NFR-LOC)
Currency, date, language and right-to-left checks
Manual plus scripts
Per new locale
8. Environments, Tools, Integrations and Test Data
Environment
Use
Data
Integrations
Dev / CI
Unit, API, smoke on each commit
Synthetic
Mocks and stubs
QA / Test
Functional, exploratory, automation
Seeded synthetic data
Provider sandboxes
Staging
Regression, performance, UAT
Anonymized production-like
Sandboxes; production-like config
Production
Post-release smoke and monitoring only
Real
Live; no test payments except approved test orders
Tools: test management [tool], defect tracker [tool], automation (Playwright / Selenium), API testing (Postman), performance (k6/JMeter), CI/CD [tool], agent evaluation harness [tool].
Test data: one account per persona (P-01 to P-06), provider test cards and UPI IDs for success, decline, 3DS and timeout, products covering every variant and stock state, coupons for every rule, orders in every status. Data is reset before each regression run; no real customer data in non-production.
Integration testing: each INT item is tested for success, error, timeout and retry using sandbox, mock or fault injection.
9. Defect Management and Reporting
Severity
Definition
Fix target
Sev-1
Checkout, payment or data loss blocked; security breach
Same day
Sev-2
Major feature broken, no workaround
2 working days
Sev-3
Feature impaired, workaround exists
Next sprint
Sev-4
Cosmetic or minor
Backlog
Lifecycle: New, Triaged, In progress, Fixed, Ready for retest, Verified, Closed (or Reopened, Rejected, Deferred). Triage runs daily during test cycles with QA, development and product.
Reporting: daily execution summary; weekly dashboard (pass rate, defects by severity and module, coverage, automation share); release readiness report against section 11 criteria. Agent evaluation results are reported separately by dimension.
10. Security and Compliance Testing
Area
Approach
OWASP Top 10
Dynamic scan each release; manual checks for broken access control, injection, XSS, CSRF
Authentication and sessions
Lockout, reset link expiry, session timeout, MFA for admins
Authorization
Role matrix and object-level access checks across users
Payments (PCI scope)
Verify card data never appears in storage, logs or network calls to the application
Privacy
Consent, data export and deletion workflows, log masking
Penetration test
External test before launch and yearly
AI safety
Adversarial scenario set from section 6
11. Entry/Exit Criteria, Risks and Release Sign-off
Gate
Criteria
Entry
Build deployed to QA; smoke suite passes; requirements baselined; test data loaded
Exit (release)
100% of Must / P1 cases executed and passed; ≥ 95% overall pass; 0 Sev-1 and ≤ 3 Sev-2 open with workarounds; performance and security targets met; agent accuracy ≥ 90% and safety 100%; UAT signed off
Suspension
Smoke suite fails, environment down, or blocker defect stops more than 30% of planned cases
Risk
Mitigation
Provider sandbox differs from production
Production smoke with approved low-value test orders; monitoring
Late requirement changes
Change control with impact on test scope; risk-based re-planning
Non-deterministic agent results
Multiple runs, rubric scoring, fixed evaluation set
Shared environment conflicts
Booking calendar, data reset scripts
Sign-off: QA lead, product owner, engineering lead, security (for launch releases).
12. Traceability and Glossary
Every PRD requirement ID is traced to test cases in the Test Case template (section 12) and reported by coverage in each cycle. Unmapped Must requirements block the exit gate.
Glossary: UAT = user acceptance testing; Sev = severity; INT = integration; NFR = non-functional requirement; 3DS = 3-D Secure; RBAC = role-based access control; P1 = highest test priority.