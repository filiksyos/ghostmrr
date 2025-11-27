import { VerifiedProfile } from '@/lib/types/verification';

const STORAGE_KEY = 'ghostmrr_verified_profile';

/**
 * Store verified profile in localStorage
 */
export function saveVerifiedProfile(profile: VerifiedProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save verified profile:', error);
  }
}

/**
 * Retrieve verified profile from localStorage
 */
export function getVerifiedProfile(): VerifiedProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const profile: VerifiedProfile = JSON.parse(stored);
    
    // Validate the profile has required fields
    if (!profile.did || !profile.metrics || !profile.publicKey || !profile.signature) {
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Failed to retrieve verified profile:', error);
    return null;
  }
}

/**
 * Clear verified profile from localStorage
 */
export function clearVerifiedProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear verified profile:', error);
  }
}

/**
 * Check if user has a verified profile
 */
export function hasVerifiedProfile(): boolean {
  return getVerifiedProfile() !== null;
}

/**
 * Add a group to the user's joined groups
 */
export function addGroupToProfile(groupSlug: 'exact-numbers' | '10-mrr-club'): boolean {
  try {
    const profile = getVerifiedProfile();
    if (!profile) return false;
    
    if (!profile.joinedGroups.includes(groupSlug)) {
      profile.joinedGroups.push(groupSlug);
      saveVerifiedProfile(profile);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to add group to profile:', error);
    return false;
  }
}

/**
 * Check if user's profile meets eligibility for a group
 */
export function checkGroupEligibility(
  profile: VerifiedProfile | null,
  groupSlug: 'exact-numbers' | '10-mrr-club'
): { eligible: boolean; reason?: string } {
  if (!profile) {
    return { eligible: false, reason: 'No verified profile found' };
  }
  
  switch (groupSlug) {
    case 'exact-numbers':
      if (profile.metrics.mrr >= 1) {
        return { eligible: true };
      }
      return { eligible: false, reason: 'Requires MRR >= $1' };
      
    case '10-mrr-club':
      if (profile.metrics.mrr >= 10) {
        return { eligible: true };
      }
      return { eligible: false, reason: 'Requires MRR >= $10' };
      
    default:
      return { eligible: false, reason: 'Unknown group' };
  }
}

/**
 * Check if user has already joined a specific group
 */
export function hasJoinedGroup(groupSlug: 'exact-numbers' | '10-mrr-club'): boolean {
  const profile = getVerifiedProfile();
  if (!profile) return false;
  return profile.joinedGroups.includes(groupSlug);
}

