import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { allure } from 'allure-playwright';
import { expect, test } from '../../src/fixtures/test-fixtures';
import { addAllureMetadata } from '../../src/utils/allureMetadata';
import { env } from '../../src/utils/env';

const authState = path.resolve('.auth', 'user.json');

test('TC_SETUP_001 authenticated storage state is saved @smoke @auth @regression', async ({
  header,
  loginPage,
  page,
}) => {
  await addAllureMetadata('Authentication', 'Setup', 'critical');

  await test.step('Open the application and account form', async () => {
    await page.goto('/');
    await loginPage.dismissOverlays();
    await header.openAccount();
  });

  await test.step('Sign in with the configured test account', async () => {
    await loginPage.login(env.testUserEmail, env.testUserPassword);
    await expect(loginPage.logoutButton).toBeVisible();
  });

  await test.step('Save the authenticated browser state', async () => {
    await mkdir(path.dirname(authState), { recursive: true });
    await page.context().storageState({ path: authState });
    await allure.parameter('storageState', '.auth/user.json');
  });
});
