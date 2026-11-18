import { expect, test } from '../src/fixtures/test-fixtures';
import { addAllureMetadata } from '../src/utils/allureMetadata';
import { env } from '../src/utils/env';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Product', () => {
  test('TC_PRODUCT_001 open product from search results @smoke @regression @guest', async ({
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Catalog', 'Product', 'critical');

    await test.step('Search for the configured product', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
    });

    await test.step('Verify the product heading is visible', async () => {
      await expect(productDetailPage.productHeading()).toBeVisible();
    });
  });

  test('TC_PRODUCT_002 product details are visible @regression @guest', async ({
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Catalog', 'Product', 'normal');

    await test.step('Open the configured product from search', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
    });

    await test.step('Verify the product name is displayed as a heading', async () => {
      await expect(productDetailPage.productHeading()).toBeVisible();
    });
  });

  test('TC_PRODUCT_003 add item to cart from product page @smoke @regression @guest', async ({
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
    cartPage,
  }) => {
    await addAllureMetadata('Catalog', 'Product', 'critical');

    await test.step('Open the configured product from search', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
    });

    await test.step('Add the product to the cart', async () => {
      await productDetailPage.addToCart();
      await header.openCart();
    });

    await test.step('Verify the configured item is in the cart', async () => {
      await expect(cartPage.itemRow(env.testProductName)).toBeVisible();
    });
  });

  test('TC_PRODUCT_004 required option blocks add to cart when unselected @negative @regression @guest', async ({
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Catalog', 'Product Options', 'normal');

    await test.step('Open the configured product from search', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
    });

    await test.step('Skip when the product has no option controls', async () => {
      test.skip((await productDetailPage.optionControlCount()) === 0, 'Product options are not present.');
    });

    await test.step('Submit without selecting an option', async () => {
      await productDetailPage.addToCart();
    });

    await test.step('Verify option validation is visible', async () => {
      await expect(productDetailPage.alertMessages).toBeVisible();
    });
  });
});
