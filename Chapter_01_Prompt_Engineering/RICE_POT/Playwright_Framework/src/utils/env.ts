import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Copy .env.example to .env and provide a value.`);
  }

  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function parseBaseUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw new Error('BASE_URL must be an absolute HTTP or HTTPS URL.', { cause: error });
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('BASE_URL must use HTTP or HTTPS.');
  }
  if (url.hostname === 'shop.example.com') {
    throw new Error('BASE_URL still contains the example value from .env.example.');
  }

  return url.toString().replace(/\/$/, '');
}

function parseBoolean(name: string, value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  throw new Error(`${name} must be either "true" or "false".`);
}

const userEmail = required('TEST_USER_EMAIL');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
  throw new Error('TEST_USER_EMAIL must be a valid email address.');
}

const userPassword = required('TEST_USER_PASSWORD');
if (userPassword === 'replace-with-test-account-password') {
  throw new Error('TEST_USER_PASSWORD still contains the example value from .env.example.');
}

const testIdAttribute = optional('TEST_ID_ATTRIBUTE') ?? 'data-testid';
if (!/^[A-Za-z_:][A-Za-z0-9_:.-]*$/.test(testIdAttribute)) {
  throw new Error('TEST_ID_ATTRIBUTE must be a valid HTML attribute name.');
}

export type Environment = Readonly<{
  allowOrderPlacement: boolean;
  baseUrl: string;
  noResultTerm: string;
  sandboxPaymentMethod: string | undefined;
  searchTerm: string;
  testIdAttribute: string;
  testProductName: string;
  testUserEmail: string;
  testUserPassword: string;
}>;

export const env: Environment = Object.freeze({
  allowOrderPlacement: parseBoolean('ALLOW_ORDER_PLACEMENT', optional('ALLOW_ORDER_PLACEMENT'), false),
  baseUrl: parseBaseUrl(required('BASE_URL')),
  noResultTerm: required('NO_RESULT_TERM'),
  sandboxPaymentMethod: optional('SANDBOX_PAYMENT_METHOD'),
  searchTerm: required('SEARCH_TERM'),
  testIdAttribute,
  testProductName: required('TEST_PRODUCT_NAME'),
  testUserEmail: userEmail,
  testUserPassword: userPassword,
});
