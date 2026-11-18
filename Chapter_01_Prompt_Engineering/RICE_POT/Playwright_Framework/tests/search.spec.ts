import { expect, test } from '../src/fixtures/test-fixtures';
import { searchData } from '../src/data/search.data';
import { addAllureMetadata } from '../src/utils/allureMetadata';
import { env } from '../src/utils/env';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Search', () => {
  test('TC_SEARCH_001 valid term returns matching results @smoke @regression @guest', async ({
    header,
    homePage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Catalog', 'Search', 'critical');

    await test.step('Open the home page', async () => {
      await homePage.open();
    });

    await test.step('Search with the configured term', async () => {
      await header.search(env.searchTerm);
    });

    await test.step('Verify results include the configured term', async () => {
      await expect.poll(() => searchResultsPage.matchingResultCount(env.searchTerm)).toBeGreaterThan(0);
    });
  });

  test('TC_SEARCH_002 no-result term returns no matching products @negative @regression @guest', async ({
    header,
    homePage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Catalog', 'Search', 'normal');

    await test.step('Open the home page', async () => {
      await homePage.open();
    });

    await test.step('Search with the configured no-result term', async () => {
      await header.search(env.noResultTerm);
    });

    await test.step('Verify no matching product result is listed', async () => {
      await expect.poll(() => searchResultsPage.matchingResultCount(env.noResultTerm)).toBe(0);
    });
  });

  test('TC_SEARCH_003 special characters are accepted by search @negative @regression @guest', async ({
    header,
    homePage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Catalog', 'Search', 'minor');

    await test.step('Open the home page', async () => {
      await homePage.open();
    });

    await test.step('Search with the configured term and special characters', async () => {
      await header.search(searchData.specialCharacterTerm);
    });

    await test.step('Verify the results region remains available', async () => {
      await expect(searchResultsPage.mainRegion).toBeVisible();
    });
  });

  test('TC_SEARCH_004 result content contains the search term @regression @guest', async ({
    header,
    homePage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Catalog', 'Search', 'normal');

    await test.step('Open the home page', async () => {
      await homePage.open();
    });

    await test.step('Search with the configured term', async () => {
      await header.search(env.searchTerm);
    });

    await test.step('Verify at least one listed result contains the term', async () => {
      await expect.poll(() => searchResultsPage.matchingResultCount(env.searchTerm)).toBeGreaterThan(0);
    });
  });
});
