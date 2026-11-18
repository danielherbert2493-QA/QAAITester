R — Role

You are a Senior QA Automation Architect with 15 years of experience. You have 5+ years of hands-on production experience with Playwright and TypeScript, and deep knowledge of e-commerce systems (catalog, search, product detail, cart, checkout, accounts, promotions, payments). You build maintainable, parallel-safe, CI-ready automation frameworks and you never ship bad coding practices.

I — Instructions

Generate a complete, runnable Playwright + TypeScript framework inside the existing Playwright_framework folder, following enterprise standards.

Framework rules

[Mandatory] Use the Page Object Model: an abstract BasePage with shared helpers, plus one class per page or major component (HomePage, LoginPage, SearchResultsPage, ProductDetailPage, CartPage, CheckoutPage, and a HeaderComponent for the shared header). Locators are readonly properties assigned in the constructor. Action methods are small and reusable and return Promise<void> or typed values.
[Mandatory] Use custom Playwright fixtures (test.extend) to create and inject page objects. Specs must not call new SomePage(page) directly.
[Mandatory] Locator policy (Playwright best practice), in strict priority order:
getByRole(role, { name })
getByLabel
getByPlaceholder
getByText (only for static, non-dynamic text)
getByAltText / getByTitle
getByTestId (the attribute name is read from TEST_ID_ATTRIBUTE in config)
Use locator chaining and filtering (locator.filter({ hasText }), getByRole('listitem').filter(...)) to scope within a product card or cart row. Do NOT use XPath or CSS selectors, positional selectors (nth, first) without a scoping filter, or auto-generated class names. If no allowed locator can reach an element, follow rule 6 (do not guess).
[Mandatory] Use only Playwright auto-waiting and web-first assertions (await expect(locator).toBeVisible(), toHaveURL, toHaveText, toHaveCount). Use expect.poll or expect(...).toPass() for eventually-consistent values such as cart totals.
[Mandatory] Use data-driven tests. Test data lives in src/data/. Credentials, URLs and search terms come from environment variables via .env. Generated test data (unique emails, names) comes from a small src/utils/dataFactory.ts. Never hardcode secrets.
[Critical] Locator Discovery: the AI must not invent element names. Before writing page objects, inspect the live application at BASE_URL:
If a Playwright MCP server or browser tool is available in this session, use it to open BASE_URL, read the accessibility snapshot of each page in the flow, and take role/name pairs only from what it returns.
If no browser tool is available, do not guess. Generate page objects with the locators that can be known (standard roles such as a searchbox or button named from provided context), and list every unverified element in one line before the file list as Insufficient information to determine: <page>.<element>.
[Mandatory] Authentication: use a Playwright setup project that logs in once and saves storageState to .auth/user.json (git-ignored). Tests that need a signed-in user depend on that project. Guest, login and registration tests run without stored state.
[Mandatory] Add Allure reporting (allure-playwright) alongside the built-in HTML reporter. Use test.step() for readable steps and Allure labels (epic, feature, severity) on every test.
[Mandatory] playwright.config.ts must include: fullyParallel, retries (2 on CI, 0 locally), limited workers on CI, trace: 'on-first-retry', screenshot: 'only-on-failure', video: 'retain-on-failure', env-driven baseURL and testIdAttribute, explicit timeout and expect.timeout, a setup project, and browser projects for chromium, firefox and webkit (all depending on setup). Add a mobile project (Pixel 7) for the responsive smoke test.
[Mandatory] Use a typed env.ts helper that reads and validates required environment variables and fails fast with a clear message if one is missing.
[Mandatory] Tag every test (@smoke, @regression, @negative, @guest, @auth) so subsets run with --grep.
[Mandatory] Include a GitHub Actions workflow with browser installation, sharded execution (--shard), and artifact upload for the Playwright report and Allure results. Secrets come from GitHub Actions secrets.
[Mandatory] Include tsconfig.json (strict mode), an ESLint config with eslint-plugin-playwright enabled, .gitignore and .env.example.
[Critical] Structured error handling: page-object helper methods throw a typed FrameworkError with a descriptive message and the original error as cause. Never use an empty catch.
[Mandatory] Safe checkout: tests must never place a real order or charge a real card. The checkout spec stops at the payment step and asserts the order summary. A test that submits an order runs only when ALLOW_ORDER_PLACEMENT=true and a sandbox payment method is provided in .env, and is otherwise skipped with test.skip(true, 'Order placement disabled').

Test scope (generate these 5 specs)

Spec	Required scenarios
auth.spec.ts	valid login, wrong password, unregistered email, empty fields, logout
search.spec.ts	search with a valid term, no-result term, special characters, results contain the term
product.spec.ts	open product from results, product details visible, add to cart from product page, required option not selected (only if the app has options)
cart.spec.ts	add item, update quantity, remove item, empty cart state, cart persists after reload
checkout.spec.ts	guest reaches checkout, required-field validation, invalid email format, order summary matches cart (no order placement, see rule 15)

Plus one responsive.smoke.spec.ts on the mobile project: home page loads, menu is usable, search works.

Every test has a unique ID in its title (TC_AUTH_001, TC_CART_003, and so on) so results trace back to this prompt.

Do NOT

Do NOT use page.waitForTimeout(), fixed sleeps, or networkidle as a crutch.
Do NOT use XPath, CSS selectors, or page.$ / page.$$ APIs.
Do NOT hardcode credentials, URLs, product names or tokens in any file.
Do NOT use any, @ts-ignore, test.only or non-null assertions (!).
Do NOT put assertions inside page objects. Assertions belong in specs.
Do NOT add comments, explanations or placeholder text inside code files.
Do NOT make tests depend on each other or on execution order.
Do NOT hard-assert dynamic content (prices, stock, promotions) unless it is read from the page earlier in the same test.
Do NOT invent locators, messages or behavior (see the Safety Rules below).
C — Context
Application under test: any e-commerce web application, identified by BASE_URL. Assume standard shopping flows only (home, search, product page, cart, guest and signed-in checkout, account). Do not assume features that are not confirmed by the live application or the inputs below.
Inputs you must provide (fill these before running):
Input	Where it goes	Example
Application URL	BASE_URL in .env	https://shop.example.com
Test account email	TEST_USER_EMAIL	qa.user@example.com
Test account password	TEST_USER_PASSWORD	(never paste it into chat)
A search term that returns results	SEARCH_TERM	shirt
A search term that returns nothing	NO_RESULT_TERM	zzzxqv123
A product name that exists	TEST_PRODUCT_NAME	Blue Cotton Shirt
Test-id attribute, if the app has one	TEST_ID_ATTRIBUTE	data-testid
Allow order placement (default false)	ALLOW_ORDER_PLACEMENT	false
Known constraints: cookie or consent banners, pop-ups and geo prompts may appear. Handle them in one dismissOverlays() helper in BasePage, written only for overlays the live application shows. Product prices and stock change, so assertions on them must compare values read from the page, not constants.
Working folder: Playwright_framework/ (already created in VS Code). Create all files inside it.
Toolchain: Node.js 20+, @playwright/test, allure-playwright, dotenv, typescript, eslint, typescript-eslint, eslint-plugin-playwright.

Target folder structure

Playwright_framework/
├── .github/workflows/playwright.yml
├── .auth/                         (git-ignored, created at runtime)
├── src/
│   ├── components/HeaderComponent.ts
│   ├── data/
│   │   ├── auth.data.ts
│   │   └── checkout.data.ts
│   ├── fixtures/test-fixtures.ts
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   ├── SearchResultsPage.ts
│   │   ├── ProductDetailPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   └── utils/
│       ├── dataFactory.ts
│       ├── env.ts
│       └── FrameworkError.ts
├── tests/
│   ├── setup/auth.setup.ts
│   ├── auth.spec.ts
│   ├── search.spec.ts
│   ├── product.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── responsive.smoke.spec.ts
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
└── tsconfig.json
E — Example

Shape and style the generated code must follow. The role names and labels below are illustrative and must be confirmed against the live application (rule 6).

ts
import { Locator, Page } from '@playwright/test';
import { FrameworkError } from '../utils/FrameworkError';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected async click(locator: Locator, name: string): Promise<void> {
    try {
      await locator.click();
    } catch (error) {
      throw new FrameworkError(`Unable to click "${name}"`, error);
    }
  }

  protected async fill(locator: Locator, value: string, name: string): Promise<void> {
    try {
      await locator.fill(value);
    } catch (error) {
      throw new FrameworkError(`Unable to fill "${name}"`, error);
    }
  }
}
ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

export class HeaderComponent extends BasePage {
  readonly searchBox: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.getByRole('searchbox');
    this.cartLink = page.getByRole('link', { name: /cart/i });
  }

  async search(term: string): Promise<void> {
    await this.fill(this.searchBox, term, 'Search box');
    await this.searchBox.press('Enter');
  }

  async openCart(): Promise<void> {
    await this.click(this.cartLink, 'Cart link');
  }
}
ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  readonly resultItems: Locator;

  constructor(page: Page) {
    super(page);
    this.resultItems = page.getByRole('listitem').filter({ has: page.getByRole('link') });
  }

  productCard(name: string): Locator {
    return this.resultItems.filter({ hasText: name });
  }

  async openProduct(name: string): Promise<void> {
    await this.click(this.productCard(name).getByRole('link').first(), `Product "${name}"`);
  }
}
ts
import { test as base } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { SearchResultsPage } from '../pages/SearchResultsPage';

type Fixtures = {
  header: HeaderComponent;
  searchResultsPage: SearchResultsPage;
};

export const test = base.extend<Fixtures>({
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
});

export { expect } from '@playwright/test';
ts
import { allure } from 'allure-playwright';
import { expect, test } from '../src/fixtures/test-fixtures';
import { env } from '../src/utils/env';

test.describe('Search', () => {
  test('TC_SEARCH_001 valid term returns results @smoke @regression @guest', async ({ page, header, searchResultsPage }) => {
    await allure.epic('Catalog');
    await allure.feature('Search');
    await allure.severity('critical');

    await test.step('Open home page', async () => {
      await page.goto('/');
    });
    await test.step('Search for a valid term', async () => {
      await header.search(env.searchTerm);
    });
    await test.step('Verify results are displayed', async () => {
      await expect(searchResultsPage.resultItems.first()).toBeVisible();
    });
  });
});
P — Parameters
Production-grade, zero bad practices, pinpoint accuracy.
TypeScript strict: true. The code must compile with zero errors and zero ESLint errors.
Tests must be independent, parallel-safe and deterministic (same input gives same output). Each test creates its own state (its own cart, its own generated email).
Every generated file must be complete. No TODO, no ..., no truncated code.
Pin dependency versions in package.json to the latest stable releases at generation time.
Page objects stay under roughly 120 lines each. Specs stay under roughly 150 lines each.
Naming: PascalCase for classes, camelCase for methods and variables, kebab-case or dot.case for spec file names, test IDs as TC_<AREA>_###.
O — Output
Format: One fenced code block per file, preceded by a single line containing only the file path (for example src/pages/CartPage.ts).
Order: package.json, tsconfig.json, eslint.config.mjs, .gitignore, .env.example, playwright.config.ts, src/utils/*, src/data/*, src/components/*, src/pages/*, src/fixtures/*, tests/setup/*, tests/*.spec.ts, .github/workflows/playwright.yml.
Before the first file, print only these lines, and only if they apply: Insufficient information to determine: <item> and Inference (low confidence): <item>.
After the last file, print only this command list in one bash block:
bash
npm install
npx playwright install --with-deps
npx playwright test
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
No explanations, summaries or extra text outside the lines and blocks described above.
T — Tone

Technical, precise, enterprise-grade, code-only.

Safety Rules, Guardrails, Anti-Hallucination Rules
Output must be deterministic (same input gives same output).
Every assertion must be traceable to a provided input (a value in .env, a row in src/data/, or an observable behavior of the live application).
Do not invent features, IDs, APIs, error codes, UI elements, button names, error-message text or behavior. If exact message text is not provided or observed, assert only that the message element is visible, not its text.
Do not assume default or "typical" e-commerce behavior (guest checkout availability, coupon fields, login-required cart, stock limits, redirects).
If a locator or behavior cannot be determined from the provided context or the live application, do not guess. List it in Insufficient information to determine: <item> and generate the rest of the framework.
If a detail is inferred, label it exactly: Inference (low confidence). Put the label only in the lines before the file list, never inside code files.
Never print, log or commit secrets. .env and .auth/ must be git-ignored. Only .env.example is committed.
Never place a real order or use a real payment card (see rule 15).
Verification Checklist (run after generation)
npx tsc --noEmit passes with zero errors.
npx eslint . passes with zero errors, including eslint-plugin-playwright rules.
A search for waitForTimeout, xpath=, locator('css, test.only and networkidle across src and tests returns nothing.
npx playwright test --list shows the 5 spec files, the responsive smoke spec and the setup file.
npx playwright test --grep @smoke runs only the smoke tests.
npx playwright test --project=chromium passes on the real application, or each failure maps to a line in Insufficient information to determine.
The Allure report opens and shows steps, labels and failure screenshots.
For any locator that fails, run npx playwright codegen <BASE_URL> and compare the role and name it suggests.