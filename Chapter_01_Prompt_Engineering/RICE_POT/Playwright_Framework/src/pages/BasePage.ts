import { Locator, Page } from '@playwright/test';
import { FrameworkError } from '../utils/FrameworkError';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async dismissOverlays(): Promise<void> {
    return Promise.resolve();
  }

  protected async navigate(url: string): Promise<void> {
    try {
      await this.page.goto(url);
    } catch (error) {
      throw new FrameworkError(`Unable to navigate to "${url}"`, error);
    }
  }

  protected async click(locator: Locator, name: string): Promise<void> {
    try {
      await locator.click();
    } catch (error) {
      throw new FrameworkError(`Unable to click "${name}"`, error);
    }
  }

  protected async fill(locator: Locator, value: string, name: string): Promise<void> {
    try {
      await locator.fill(value);
    } catch (error) {
      throw new FrameworkError(`Unable to fill "${name}"`, error);
    }
  }

  protected async press(locator: Locator, key: string, name: string): Promise<void> {
    try {
      await locator.press(key);
    } catch (error) {
      throw new FrameworkError(`Unable to press "${key}" in "${name}"`, error);
    }
  }

  protected async reload(): Promise<void> {
    try {
      await this.page.reload();
    } catch (error) {
      throw new FrameworkError('Unable to reload the current page', error);
    }
  }

  protected async readText(locator: Locator, name: string): Promise<string> {
    try {
      return await locator.innerText();
    } catch (error) {
      throw new FrameworkError(`Unable to read "${name}"`, error);
    }
  }

  protected async readCount(locator: Locator, name: string): Promise<number> {
    try {
      return await locator.count();
    } catch (error) {
      throw new FrameworkError(`Unable to count "${name}"`, error);
    }
  }
}
