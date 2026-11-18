export type AuthScenario = Readonly<{
  id: string;
  name: string;
  severity: 'critical' | 'normal' | 'minor';
}>;

export const authScenarios: Readonly<{
  emptyFields: AuthScenario;
  logout: AuthScenario;
  unregisteredEmail: AuthScenario;
  validLogin: AuthScenario;
  wrongPassword: AuthScenario;
}> = Object.freeze({
  emptyFields: { id: 'TC_AUTH_004', name: 'empty fields', severity: 'normal' },
  logout: { id: 'TC_AUTH_005', name: 'logout', severity: 'normal' },
  unregisteredEmail: { id: 'TC_AUTH_003', name: 'unregistered email', severity: 'normal' },
  validLogin: { id: 'TC_AUTH_001', name: 'valid login', severity: 'critical' },
  wrongPassword: { id: 'TC_AUTH_002', name: 'wrong password', severity: 'normal' },
});
