/**
 * Web Crypto API utilities for encrypting sensitive cached data
 * 
 * Uses AES-GCM 256-bit encryption with PBKDF2 key derivation
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT = new Uint8Array([
  0x42, 0x53, 0x56, 0x2d, 0x50, 0x57, 0x41, 0x2d,
  0x53, 0x41, 0x4c, 0x54, 0x2d, 0x32, 0x30, 0x32, // BSV-PWA-SALT-202
  0x36, 0x2d, 0x56, 0x31, 0x2e, 0x30, 0x2e, 0x30, // 6-V1.0.0
]);

let cachedKey = null;

/**
 * Derive encryption key from user secret using PBKDF2
 * @param {string} secret - User-specific secret (e.g., user ID + auth token)
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(secret) {
  if (cachedKey) return cachedKey;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return cachedKey;
}

/**
 * Encrypt data
 * @param {string} plaintext - Data to encrypt
 * @param {string} secret - User secret for key derivation
 * @returns {Promise<string>} Base64-encoded encrypted data with IV prepended
 */
export async function encrypt(plaintext, secret) {
  try {
    const key = await deriveKey(secret);
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    // Prepend IV to encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('[Crypto] Encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data
 * @param {string} ciphertext - Base64-encoded encrypted data with IV prepended
 * @param {string} secret - User secret for key derivation
 * @returns {Promise<string>} Decrypted plaintext
 */
export async function decrypt(ciphertext, secret) {
  try {
    const key = await deriveKey(secret);

    // Decode from base64
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    // Decode to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Clear cached key (call on logout)
 */
export function clearCachedKey() {
  cachedKey = null;
}

/**
 * Generate user-specific secret from auth data
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {string}
 */
export function generateSecret(userId, token) {
  return `${userId}:${token}`;
}
