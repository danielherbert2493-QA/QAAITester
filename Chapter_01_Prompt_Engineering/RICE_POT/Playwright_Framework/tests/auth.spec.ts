import { expect, test } from '../src/fixtures/test-fixtures';
import { authScenarios } from '../src/data/auth.data';
import { addAllureMetadata } from '../src/utils/allureMetadata';
import { createInvalidPassword, createShopperIdentity } from '../src/utils/dataFactory';
import { env } from '../src/utils/env';

test.describe('Authentication', () => {
  test.describe('Guest authentication', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test(`${authScenarios.validLogin.id} ${authScenarios.validLogin.name} @smoke @regression @auth`, async ({
      header,
      homePage,
      loginPage,
    }) => {
      await addAllureMetadata('Account', 'Login', authScenarios.validLogin.severity);

      await test.step('Open the account sign-in form', async () => {
        await homePage.open();
        await header.openAccount();
      });

      await test.step('Sign in with the configured test account', async () => {
        await loginPage.login(env.testUserEmail, env.testUserPassword);
      });

      await test.step('Verify the authenticated account action is available', async () => {
        await expect(loginPage.logoutButton).toBeVisible();
      });
    });

    test(`${authScenarios.wrongPassword.id} ${authScenarios.wrongPassword.name} @negative @regression @guest`, async ({
      header,
      homePage,
      loginPage,
    }) => {
      await addAllureMetadata('Account', 'Login', authScenarios.wrongPassword.severity);

      await test.step('Open the account sign-in form', async () => {
        await homePage.open();
        await header.openAccount();
      });

      await test.step('Submit the configured account with an invalid password', async () => {
        await loginPage.login(env.testUserEmail, createInvalidPassword());
      });

      await test.step('Verify a login error is visible', async () => {
        await expect(loginPage.alertMessages).toBeVisible();
      });
    });

    test(`${authScenarios.unregisteredEmail.id} ${authScenarios.unregisteredEmail.name} @negative @regression @guest`, async ({
      header,
      homePage,
      loginPage,
    }) => {
      const identity = createShopperIdentity();
      await addAllureMetadata('Account', 'Login', authScenarios.unregisteredEmail.severity);

      await test.step('Open the account sign-in form', async () => {
        await homePage.open();
        await header.openAccount();
      });

      await test.step('Submit an unregistered email address', async () => {
        await loginPage.login(identity.email, createInvalidPassword());
      });

      await test.step('Verify a login error is visible', async () => {
        await expect(loginPage.alertMessages).toBeVisible();
      });
    });

    test(`${authScenarios.emptyFields.id} ${authScenarios.emptyFields.name} @negative @regression @guest`, async ({
      header,
      homePage,
      loginPage,
    }) => {
      await addAllureMetadata('Account', 'Login', authScenarios.emptyFields.severity);

      await test.step('Open the account sign-in form', async () => {
        await homePage.open();
        await header.openAccount();
      });

      await test.step('Submit the sign-in form without credentials', async () => {
        await loginPage.submitEmptyForm();
      });

      await test.step('Verify required-field validation is visible', async () => {
        await expect(loginPage.alertMessages).toBeVisible();
      });
    });
  });

  test('TC_AUTH_005 logout @regression @auth', async ({ loginPage }) => {
    await addAllureMetadata('Account', 'Logout', 'normal');

    await test.step('Sign out of the authenticated account', async () => {
      await loginPage.logout();
    });

    await test.step('Verify the sign-in action is available again', async () => {
      await expect(loginPage.submitButton).toBeVisible();
    });
  });
});
