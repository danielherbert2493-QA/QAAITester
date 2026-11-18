import { expect, test } from '../src/fixtures/test-fixtures';
import { checkoutScenarios, invalidEmailCases } from '../src/data/checkout.data';
import { addAllureMetadata } from '../src/utils/allureMetadata';
import { createShopperIdentity } from '../src/utils/dataFactory';
import { env } from '../src/utils/env';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Guest checkout', () => {
  test(`${checkoutScenarios.guestCheckout.id} guest reaches checkout @smoke @regression @guest`, async ({
    cartPage,
    header,
    homePage,
    productDetailPage,
    checkoutPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Checkout', 'Guest Checkout', checkoutScenarios.guestCheckout.severity);

    await test.step('Add the configured product to a guest cart', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
      await productDetailPage.addToCart();
      await header.openCart();
    });

    await test.step('Continue from the cart to checkout', async () => {
      await cartPage.openCheckout();
    });

    await test.step('Verify checkout content is visible to the guest', async () => {
      await expect(checkoutPage.mainRegion).toBeVisible();
    });
  });

  test(`${checkoutScenarios.requiredFieldValidation.id} checkout validates required fields @negative @regression @guest`, async ({
    cartPage,
    checkoutPage,
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    await addAllureMetadata('Checkout', 'Validation', checkoutScenarios.requiredFieldValidation.severity);

    await test.step('Open checkout with a configured product in the guest cart', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
      await productDetailPage.addToCart();
      await header.openCart();
      await cartPage.openCheckout();
    });

    await test.step('Continue without completing required fields', async () => {
      await checkoutPage.continueToPayment();
    });

    await test.step('Verify validation feedback is visible', async () => {
      await expect(checkoutPage.alertMessages).toBeVisible();
    });
  });

  for (const invalidEmailCase of invalidEmailCases) {
    test(`${invalidEmailCase.id} rejects ${invalidEmailCase.email} @negative @regression @guest`, async ({
      cartPage,
      checkoutPage,
      header,
      homePage,
      productDetailPage,
      searchResultsPage,
    }) => {
      await addAllureMetadata('Checkout', 'Email Validation', 'normal');

      await test.step('Open checkout with a configured product in the guest cart', async () => {
        await homePage.open();
        await header.search(env.searchTerm);
        await searchResultsPage.openProduct(env.testProductName);
        await productDetailPage.addToCart();
        await header.openCart();
        await cartPage.openCheckout();
      });

      await test.step('Submit the invalid email address', async () => {
        await checkoutPage.fillEmail(invalidEmailCase.email);
        await checkoutPage.continueToPayment();
      });

      await test.step('Verify email validation feedback is visible', async () => {
        await expect(checkoutPage.alertMessages).toBeVisible();
      });
    });
  }

  test(`${checkoutScenarios.orderSummary.id} order summary matches cart at payment @regression @guest`, async ({
    cartPage,
    checkoutPage,
    header,
    homePage,
    productDetailPage,
    searchResultsPage,
  }) => {
    const identity = createShopperIdentity();
    await addAllureMetadata('Checkout', 'Order Summary', checkoutScenarios.orderSummary.severity);
    let cartTotal = '';

    await test.step('Add the configured product and read the cart total', async () => {
      await homePage.open();
      await header.search(env.searchTerm);
      await searchResultsPage.openProduct(env.testProductName);
      await productDetailPage.addToCart();
      await header.openCart();
      cartTotal = await cartPage.total();
    });

    await test.step('Continue as a guest to the payment step', async () => {
      await cartPage.openCheckout();
      await checkoutPage.fillEmail(identity.email);
      await checkoutPage.continueToPayment();
    });

    await test.step('Verify the checkout order summary matches the cart', async () => {
      await expect.poll(() => checkoutPage.orderTotal()).toBe(cartTotal);
    });
  });
});
