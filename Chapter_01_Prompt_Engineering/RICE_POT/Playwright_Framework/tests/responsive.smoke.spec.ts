import { expect, test } from '../src/fixtures/test-fixtures';
import { addAllureMetadata } from '../src/utils/allureMetadata';
import { env } from '../src/utils/env';

test.use({ storageState: { cookies: [], origins: [] } });

test('TC_RESPONSIVE_001 home menu and search work on mobile @smoke @regression @guest', async ({
  header,
  homePage,
  searchResultsPage,
}) => {
  await addAllureMetadata('Responsive', 'Mobile Smoke', 'normal');

  await test.step('Open the home page on the mobile project', async () => {
    await homePage.open();
    await expect(homePage.mainRegion).toBeVisible();
  });

  await test.step('Open the mobile menu', async () => {
    await header.openMenu();
    await expect(header.menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  await test.step('Search for the configured term', async () => {
    await header.search(env.searchTerm);
    await expect.poll(() => searchResultsPage.matchingResultCount(env.searchTerm)).toBeGreaterThan(0);
  });
});
