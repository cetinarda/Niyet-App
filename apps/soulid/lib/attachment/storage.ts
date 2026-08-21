// Bağlanma sonucu — cihazda kalır. Sunucuya gitmez, karneyle birlikte
// dışa aktarılmaz; kullanıcı /settings'ten tüm veriyi silince bu da gider.

import type { AttachmentResult, Answers } from './index';

const KEY_RESULT = 'soulprofile.attachment.result';
const KEY_ANSWERS = 'soulprofile.attachment.answers';

export type StoredAttachment = AttachmentResult & { takenAt: string };

export function saveAttachment(result: AttachmentResult, answers: Answers): void {
  try {
    const stored: StoredAttachment = { ...result, takenAt: new Date().toISOString() };
    localStorage.setItem(KEY_RESULT, JSON.stringify(stored));
    localStorage.setItem(KEY_ANSWERS, JSON.stringify(answers));
  } catch {
    /* private mode / kota */
  }
}

export function readAttachment(): StoredAttachment | null {
  try {
    const raw = localStorage.getItem(KEY_RESULT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttachment;
    if (typeof parsed?.anxiety !== 'number' || typeof parsed?.avoidance !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readAnswers(): Answers {
  try {
    const raw = localStorage.getItem(KEY_ANSWERS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Answers;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function clearAttachment(): void {
  try {
    localStorage.removeItem(KEY_RESULT);
    localStorage.removeItem(KEY_ANSWERS);
  } catch {
    /* ignore */
  }
}
