// Taş-başına benzersiz çeviriler: name + dailyMessage + howToUse + affirmation.
// Anahtar = stone.id. Batch'ler hâlinde dolar.
// Şema: { s001: { de:{name,dailyMessage,howToUse,affirmation}, es:{...}, ... } }
import { BATCH01 } from './sentences/batch01.mjs';
import { BATCH02 } from './sentences/batch02.mjs';

export const SENTENCES = {
  ...BATCH01,
  ...BATCH02,
};
