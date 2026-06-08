// Taş-başına benzersiz çeviriler: name + dailyMessage + howToUse + affirmation.
// Anahtar = stone.id. Batch'ler hâlinde dolar.
// Şema: { s001: { de:{name,dailyMessage,howToUse,affirmation}, es:{...}, ... } }
import { BATCH01 } from './sentences/batch01.mjs';
import { BATCH02 } from './sentences/batch02.mjs';
import { BATCH03 } from './sentences/batch03.mjs';
import { BATCH04 } from './sentences/batch04.mjs';
import { BATCH05 } from './sentences/batch05.mjs';
import { BATCH06 } from './sentences/batch06.mjs';
import { BATCH07 } from './sentences/batch07.mjs';
import { BATCH08 } from './sentences/batch08.mjs';
import { BATCH09 } from './sentences/batch09.mjs';
import { BATCH10 } from './sentences/batch10.mjs';

export const SENTENCES = {
  ...BATCH01,
  ...BATCH02,
  ...BATCH03,
  ...BATCH04,
  ...BATCH05,
  ...BATCH06,
  ...BATCH07,
  ...BATCH08,
  ...BATCH09,
  ...BATCH10,
};
