import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly mainRegion: Locator;

  constructor(page: Page) {
    super(page);
    this.mainRegion = page.getByRole('main');
  }

  async open(): Promise<void> {
    await this.navigate('/');
    await this.dismissOverlays();
  }
}
