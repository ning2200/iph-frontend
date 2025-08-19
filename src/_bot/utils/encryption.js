import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

let key = process.env.ENCRYPTION_KEY;

export function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    const encrypted = Buffer.concat([iv, cipher.update(text, 'utf-8'), cipher.final()]);
    return encrypted.toString('hex');
}

export function decrypt(encryptedText) {
    const buffer = Buffer.from(encryptedText, 'hex');
    const iv = buffer.subarray(0, 16);
    const encryptedData = buffer.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted.toString('utf-8');    
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    key = "123abc";
    const encrypted = encrypt("hello");
    const decrypted = decrypt(encrypted);
    console.log(encrypted);
    console.log(decrypted);
}

// automatic key rotation using vault services