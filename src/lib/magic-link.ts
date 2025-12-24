import crypto from 'crypto';

/**
 * Generate a secure random token for magic links
 * Returns a URL-safe base64 encoded token
 */
export function generateToken(): string {
  // Generate 32 random bytes (256 bits)
  const randomBytes = crypto.randomBytes(32);
  // Convert to base64url (URL-safe base64)
  return randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Hash a token using SHA-256 for storage
 * We use SHA-256 instead of bcrypt for faster lookups
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against a hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash),
    Buffer.from(hash)
  );
}

/**
 * Validate a magic link record
 * Returns validation result with error message if invalid
 */
export interface MagicLinkValidation {
  valid: boolean;
  error?: string;
  magicLink?: {
    id: string;
    company_id: string;
    client_id: string;
    expires_at: string;
    revoked_at: string | null;
    max_uses: number | null;
    use_count: number;
    scopes: string[];
    client_name_snapshot: string;
    client_phone_snapshot: string;
  };
}

export function validateMagicLink(
  magicLink: {
    expires_at: string;
    revoked_at: string | null;
    max_uses: number | null;
    use_count: number;
  } | null
): MagicLinkValidation {
  if (!magicLink) {
    return { valid: false, error: 'Magic link not found' };
  }

  // Check if revoked
  if (magicLink.revoked_at) {
    return { valid: false, error: 'Magic link has been revoked' };
  }

  // Check if expired
  const now = new Date();
  const expiresAt = new Date(magicLink.expires_at);
  if (now > expiresAt) {
    return { valid: false, error: 'Magic link has expired' };
  }

  // Check max uses
  if (magicLink.max_uses !== null && magicLink.use_count >= magicLink.max_uses) {
    return { valid: false, error: 'Magic link has reached maximum uses' };
  }

  return { valid: true };
}

/**
 * Format phone number to E.164 format
 * Assumes input is already in E.164 or can be converted
 */
export function formatPhoneE164(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If doesn't start with +, assume it needs country code
  // For now, return as-is if it already has +
  if (!cleaned.startsWith('+')) {
    // Could add logic here to add default country code
    // For now, we'll require E.164 format from input
    throw new Error('Phone number must be in E.164 format (e.g., +212612345678)');
  }
  
  return cleaned;
}

