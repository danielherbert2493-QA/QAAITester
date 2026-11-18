import { env } from '../utils/env';

export const searchData = Object.freeze({
  specialCharacterTerm: `${env.searchTerm} &?!`,
});
