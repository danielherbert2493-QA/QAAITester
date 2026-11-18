export type InvalidEmailCase = Readonly<{
  email: string;
  id: string;
}>;

export const invalidEmailCases: readonly InvalidEmailCase[] = Object.freeze([
  { email: 'invalid-email', id: 'TC_CHECKOUT_003' },
  { email: 'missing-domain@example', id: 'TC_CHECKOUT_004' },
]);

export const checkoutScenarios = Object.freeze({
  guestCheckout: { id: 'TC_CHECKOUT_001', severity: 'normal' as const },
  requiredFieldValidation: { id: 'TC_CHECKOUT_002', severity: 'normal' as const },
  orderSummary: { id: 'TC_CHECKOUT_005', severity: 'critical' as const },
});
