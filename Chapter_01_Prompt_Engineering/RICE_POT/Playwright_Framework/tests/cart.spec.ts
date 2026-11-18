import { expect, test } from '../src/fixtures/test-fixtures';
import { cartData } from '../src/data/cart.data';
import { addAllureMetadata } from '../src/utils/allureMetadata';
import { env } from '../src/utils/env';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Cart', () => {
  test('TC_CART_001 add item to cart @smoke @regression @guest', async ({
    cartPage,
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Shopping', 'Cart', 'critical');

    await test.step('Add the configured product from its detail page', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
      await productDetailPage.addToCart();
      await header.openCart();
    });

    await test.step('Verify the product is listed in the cart', async () => {
      await expect(cartPage.itemRow(env.testProductName)).toBeVisible();
    });
  });

  test('TC_CART_002 update item quantity @regression @guest', async ({
    cartPage,
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Shopping', 'Cart', 'normal');

    await test.step('Add the configured product and open the cart', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
      await productDetailPage.addToCart();
      await header.openCart();
    });

    await test.step('Set the product quantity to two', async () => {
      await cartPage.updateQuantity(env.testProductName, cartData.updatedQuantity);
    });

    await test.step('Verify the displayed quantity', async () => {
      await expect(cartPage.quantityFor(env.testProductName)).toHaveValue(String(cartData.updatedQuantity));
    });
  });

  test('TC_CART_003 remove item from cart @regression @guest', async ({
    cartPage,
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Shopping', 'Cart', 'normal');

    await test.step('Add the configured product and open the cart', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
      await productDetailPage.addToCart();
      await header.openCart();
    });

    await test.step('Remove the product', async () => {
      await cartPage.removeItem(env.testProductName);
    });

    await test.step('Verify the product is no longer listed', async () => {
      await expect(cartPage.itemRow(env.testProductName)).toHaveCount(0);
    });
  });

  test('TC_CART_004 empty cart has no product rows @regression @guest', async ({
    cartPage,
    header,
    homePage,
  }) => {
    await addAllureMetadata('Shopping', 'Cart', 'normal');

    await test.step('Open the cart in a fresh guest session', async () => {
      await homePage.open();
      await header.openCart();
    });

    await test.step('Verify the configured product is absent', async () => {
      await expect(cartPage.itemRow(env.testProductName)).toHaveCount(0);
    });
  });

  test('TC_CART_005 cart item persists after reload @regression @guest', async ({
    cartPage,
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Shopping', 'Cart Persistence', 'normal');

    await test.step('Add the configured product and open the cart', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
      await productDetailPage.addToCart();
      await header.openCart();
    });

    await test.step('Verify the item before reload', async () => {
      await expect(cartPage.itemRow(env.testProductName)).toBeVisible();
    });

    await test.step('Reload the cart page', async () => {
      await cartPage.reloadCart();
    });

    await test.step('Verify the item remains after reload', async () => {
      await expect(cartPage.itemRow(env.testProductName)).toBeVisible();
    });
  });
});
