// Taş-başına benzersiz çeviriler: name + dailyMessage + howToUse + affirmation.
// Anahtar = stone.id. Batch'ler hâlinde dolar.
// Şema: { s001: { de:{name,dailyMessage,howToUse,affirmation}, es:{...}, ... } }
import { BATCH01 } from './sentences/batch01.mjs';
import { BATCH02 } from './sentences/batch02.mjs';
import { BATCH03 } from './sentences/batch03.mjs';
import { BATCH04 } from './sentences/batch04.mjs';

export const SENTENCES = {
  ...BATCH01,
  ...BATCH02,
  ...BATCH03,
  ...BATCH04,
};
