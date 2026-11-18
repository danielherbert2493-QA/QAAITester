import { Locator, Page } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

export class HeaderComponent extends BasePage {
  readonly accountLink: Locator;
  readonly cartLink: Locator;
  readonly menuButton: Locator;
  readonly searchBox: Locator;

  constructor(page: Page) {
    super(page);
    this.accountLink = page.getByRole('link', { name: /account|log in|sign in/i });
    this.cartLink = page.getByRole('link', { name: /cart/i });
    this.menuButton = page.getByRole('button', { name: /menu/i });
    this.searchBox = page.getByRole('searchbox');
  }

  async search(term: string): Promise<void> {
    await this.fill(this.searchBox, term, 'Search box');
    await this.press(this.searchBox, 'Enter', 'Search box');
  }

  async openAccount(): Promise<void> {
    await this.click(this.accountLink, 'Account link');
  }

  async openCart(): Promise<void> {
    await this.click(this.cartLink, 'Cart link');
  }

  async openMenu(): Promise<void> {
    await this.click(this.menuButton, 'Menu button');
  }
}
