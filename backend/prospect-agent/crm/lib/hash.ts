import crypto from 'crypto';

/**
 * Genera hash SHA1 de un string (para IDs únicos).
 */
export function sha1(text: string): string {
  return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}
