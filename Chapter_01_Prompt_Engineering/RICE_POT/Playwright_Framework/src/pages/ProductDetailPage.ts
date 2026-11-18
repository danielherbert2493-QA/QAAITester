import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  readonly addToCartButton: Locator;
  readonly alertMessages: Locator;
  readonly optionControls: Locator;

  constructor(
    page: Page,
    readonly productName: string,
  ) {
    super(page);
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.alertMessages = page.getByRole('alert');
    this.optionControls = page.getByRole('radio').or(page.getByRole('combobox'));
  }

  productHeading(): Locator {
    return this.page.getByRole('heading', { name: this.productName, exact: true });
  }

  async addToCart(): Promise<void> {
    await this.click(this.addToCartButton, 'Add to cart button');
  }

  async optionControlCount(): Promise<number> {
    return this.readCount(this.optionControls, 'product option controls');
  }
}
