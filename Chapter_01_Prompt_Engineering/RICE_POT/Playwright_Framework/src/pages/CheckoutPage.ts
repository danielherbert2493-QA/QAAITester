import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly alertMessages: Locator;
  readonly continueButton: Locator;
  readonly emailInput: Locator;
  readonly mainRegion: Locator;
  readonly orderSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.alertMessages = page.getByRole('alert');
    this.continueButton = page.getByRole('button', { name: /continue|payment/i });
    this.emailInput = page.getByLabel(/email/i);
    this.mainRegion = page.getByRole('main');
    this.orderSummary = page.getByRole('region', { name: /order summary/i });
  }

  async continueToPayment(): Promise<void> {
    await this.click(this.continueButton, 'Continue to payment button');
  }

  async fillEmail(email: string): Promise<void> {
    await this.fill(this.emailInput, email, 'Checkout email');
  }

  async orderTotal(): Promise<string> {
    return this.readText(this.orderSummary.getByText(/total/i), 'checkout order total');
  }
}
