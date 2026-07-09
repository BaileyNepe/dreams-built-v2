import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { env } from '@config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const getKey = () => {
  const key = Buffer.from(env.xeroTokenEncryptionKey, 'hex');

  if (key.length !== 32) {
    throw new Error('XERO_TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return key;
};

export const encrypt = (plain: string) => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
};

export const decrypt = (blob: string) => {
  const [iv, tag, ciphertext] = blob.split(':');

  if (!iv || !tag || !ciphertext) {
    throw new Error('Invalid encrypted payload');
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final()
  ]).toString('utf8');
};
