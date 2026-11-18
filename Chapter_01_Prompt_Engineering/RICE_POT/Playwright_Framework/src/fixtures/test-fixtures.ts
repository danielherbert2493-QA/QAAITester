import { test as base, expect } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { env } from '../utils/env';

type FrameworkFixtures = Readonly<{
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: HeaderComponent;
  homePage: HomePage;
  loginPage: LoginPage;
  productDetailPage: ProductDetailPage;
  searchResultsPage: SearchResultsPage;
}>;

export const test = base.extend<FrameworkFixtures>({
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page, env.testProductName));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
});

export { expect };
