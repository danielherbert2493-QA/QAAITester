## Feature Summary
- **Feature name:** <feature_name>  (example: Product Search)
- **Entry point:** <url_or_screen>  (example: Search bar in the header of <url>)
- **User story:** As a <role>, I want to <goal> so that <benefit>.
  (example: As a customer, I want to search by keyword so that I can quickly find products.)

## Functional Behaviour
1. User types a keyword in the search bar.
2. Auto-suggestions appear after <n> characters.
3. Pressing Enter or clicking the search icon opens the results page.
4. Results can be sorted (relevance, price, rating, newest).
5. Results can be filtered (category, brand, price range, rating, delivery speed).
6. Pagination or infinite scroll loads more results.
7. Empty results show a "no results" message with suggestions.

## Inputs and Data
| Field | Rule |
|-------|------|
| Search keyword | Max <n> characters, accepts letters, numbers, symbols |
| Category dropdown | Default "All" |
| Price filter | Min and max numeric values |

## Acceptance Criteria
- AC1: Results are relevant to the keyword.
- AC2: Sort and filter can be combined and results update correctly.
- AC3: Special characters and very long input do not break the page.
- AC4: Page loads within <n> seconds on a normal connection.

## Dependencies and Risks
- Depends on: search service, product catalogue, pricing service
- Risks: slow response with many filters, inconsistent price display, typo tolerance

## Out of Scope
- Voice search, image search, seller-side search