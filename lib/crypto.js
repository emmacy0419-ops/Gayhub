const crypto = require('crypto');

const KEY = Buffer.from(process.env.CONTACT_KEY || '', 'hex');

export function encrypt(text) {
  if (!text) return '';
  if (KEY.length !== 32) throw new Error('CONTACT_KEY must be 32 bytes hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(payload) {
  if (!payload) return '';
  if (KEY.length !== 32) throw new Error('CONTACT_KEY must be 32 bytes hex');
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
