import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  readonly mainRegion: Locator;
  readonly resultItems: Locator;

  constructor(page: Page) {
    super(page);
    this.mainRegion = page.getByRole('main');
    this.resultItems = this.mainRegion.getByRole('listitem');
  }

  productCard(name: string): Locator {
    return this.resultItems.filter({ hasText: name });
  }

  matchingResults(term: string): Locator {
    return this.resultItems.filter({ hasText: term });
  }

  async openProduct(name: string): Promise<void> {
    const productLink = this.productCard(name).getByRole('link', { name, exact: true });
    await this.click(productLink, `Product link "${name}"`);
  }

  async matchingResultCount(term: string): Promise<number> {
    return this.readCount(this.matchingResults(term), `results matching "${term}"`);
  }

  async resultCount(): Promise<number> {
    return this.readCount(this.resultItems, 'search results');
  }
}
