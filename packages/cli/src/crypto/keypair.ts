import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as ed from '@noble/ed25519';

export interface KeypairData {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  did: string;
}

/**
 * Get the path to the keypair file in the user's home directory
 */
export function getKeypairPath(): string {
  const homeDir = os.homedir();
  const configDir = path.join(homeDir, '.ghostmrr');
  return path.join(configDir, 'keypair.json');
}

/**
 * Load existing keypair or generate a new one if it doesn't exist
 */
export async function loadOrCreateKeypair(): Promise<KeypairData> {
  const keypairPath = getKeypairPath();
  const configDir = path.dirname(keypairPath);

  // Create config directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { mode: 0o700, recursive: true });
  }

  // Try to load existing keypair
  if (fs.existsSync(keypairPath)) {
    try {
      const stored = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
      const privateKey = Uint8Array.from(Buffer.from(stored.privateKey, 'base64'));
      const publicKey = Uint8Array.from(Buffer.from(stored.publicKey, 'base64'));
      
      return {
        privateKey,
        publicKey,
        did: stored.did,
      };
    } catch (error) {
      // If file is corrupted, regenerate
      console.warn('⚠️  Existing keypair file is corrupted. Generating new keypair...');
    }
  }

  // Generate new keypair
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
  const did = `did:key:z${publicKeyBase64.slice(0, 32)}`;

  // Save keypair
  const keypairData = {
    privateKey: Buffer.from(privateKey).toString('base64'),
    publicKey: publicKeyBase64,
    did,
  };

  fs.writeFileSync(keypairPath, JSON.stringify(keypairData, null, 2), {
    mode: 0o600, // Owner read/write only
  });

  return {
    privateKey,
    publicKey,
    did,
  };
}

/**
 * Reset keypair by deleting the existing file
 */
export function resetKeypair(): boolean {
  const keypairPath = getKeypairPath();
  
  if (fs.existsSync(keypairPath)) {
    fs.unlinkSync(keypairPath);
    return true;
  }
  
  return false;
}

