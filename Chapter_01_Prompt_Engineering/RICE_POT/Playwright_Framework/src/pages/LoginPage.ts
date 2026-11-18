import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly alertMessages: Locator;
  readonly emailInput: Locator;
  readonly logoutButton: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.alertMessages = page.getByRole('alert');
    this.emailInput = page.getByLabel(/email/i);
    this.logoutButton = page.getByRole('button', { name: /log out|sign out/i });
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /log in|sign in/i });
  }

  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email, 'Email');
    await this.fill(this.passwordInput, password, 'Password');
    await this.click(this.submitButton, 'Login button');
  }

  async submitEmptyForm(): Promise<void> {
    await this.click(this.submitButton, 'Login button');
  }

  async logout(): Promise<void> {
    await this.click(this.logoutButton, 'Logout button');
  }
}
