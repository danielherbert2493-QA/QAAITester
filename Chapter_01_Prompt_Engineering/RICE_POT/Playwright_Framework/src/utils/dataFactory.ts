import { randomUUID } from 'node:crypto';

export type ShopperIdentity = Readonly<{
  email: string;
  name: string;
}>;

export function createShopperIdentity(): ShopperIdentity {
  const id = randomUUID().replaceAll('-', '');
  return {
    email: `qa.${id}@example.invalid`,
    name: `Test Shopper ${id}`,
  };
}

export function createInvalidPassword(): string {
  return `invalid-${randomUUID()}`;
}
