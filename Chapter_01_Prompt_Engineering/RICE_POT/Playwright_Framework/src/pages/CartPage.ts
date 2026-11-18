import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly checkoutButton: Locator;
  readonly mainRegion: Locator;
  readonly quantityInput: Locator;
  readonly removeButton: Locator;
  readonly rows: Locator;
  readonly totalText: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.getByRole('button', { name: /checkout/i });
    this.mainRegion = page.getByRole('main');
    this.quantityInput = page.getByRole('spinbutton');
    this.removeButton = page.getByRole('button', { name: /remove/i });
    this.rows = this.mainRegion.getByRole('row');
    this.totalText = this.mainRegion.getByText(/total/i);
  }

  itemRow(productName: string): Locator {
    return this.rows.filter({ hasText: productName });
  }

  quantityFor(productName: string): Locator {
    return this.itemRow(productName).getByRole('spinbutton');
  }

  async updateQuantity(productName: string, quantity: number): Promise<void> {
    const quantityInput = this.quantityFor(productName);
    await this.fill(quantityInput, String(quantity), `Quantity for "${productName}"`);
    await this.press(quantityInput, 'Enter', `Quantity for "${productName}"`);
  }

  async removeItem(productName: string): Promise<void> {
    const removeButton = this.itemRow(productName).getByRole('button', { name: /remove/i });
    await this.click(removeButton, `Remove "${productName}"`);
  }

  async openCheckout(): Promise<void> {
    await this.click(this.checkoutButton, 'Checkout button');
  }

  async reloadCart(): Promise<void> {
    await this.reload();
  }

  async total(): Promise<string> {
    return this.readText(this.totalText, 'cart total');
  }
}
