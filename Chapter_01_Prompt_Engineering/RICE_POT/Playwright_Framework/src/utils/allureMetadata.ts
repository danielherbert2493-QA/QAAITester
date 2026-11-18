import { allure } from 'allure-playwright';

export type TestSeverity = 'critical' | 'normal' | 'minor';

export async function addAllureMetadata(
  epic: string,
  feature: string,
  severity: TestSeverity,
): Promise<void> {
  await allure.epic(epic);
  await allure.feature(feature);
  await allure.severity(severity);
}
