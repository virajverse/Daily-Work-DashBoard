// Proper VAPID key generation for Web Push
const crypto = require('crypto');

function urlBase64(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate ECDSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1'
});

// Export keys in proper format
const publicKeyDer = publicKey.export({ type: 'spki', format: 'der' });
const privateKeyDer = privateKey.export({ type: 'pkcs8', format: 'der' });

// For Web Push, we need the uncompressed public key (65 bytes)
// Extract from DER format (skip ASN.1 header)
const uncompressedKey = publicKeyDer.slice(-65);

const publicKeyBase64 = urlBase64(uncompressedKey);
const privateKeyBase64 = urlBase64(privateKeyDer);

console.log('\n=== VAPID Keys Generated (Proper Format) ===\n');
console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKeyBase64}`);
console.log(`VAPID_PRIVATE_KEY=${privateKeyBase64}`);
console.log('\n');
