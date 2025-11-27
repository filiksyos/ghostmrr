'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VerificationBadge, VerifiedProfile } from '@/lib/types/verification';
import { verifyBadge } from '@/lib/crypto/verifier';
import { saveVerifiedProfile, addGroupToProfile } from '@/lib/localStorage/verifiedProfile';

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetGroup?: 'exact-numbers' | '10-mrr-club' | null;
  onVerificationComplete?: () => void;
}

export default function VerificationDialog({ open, onOpenChange, targetGroup, onVerificationComplete }: VerificationDialogProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showIdentityChoice, setShowIdentityChoice] = useState(false);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [verifiedBadge, setVerifiedBadge] = useState<VerificationBadge | null>(null);
  const [website, setWebsite] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const badge: VerificationBadge = JSON.parse(input);
      
      // Client-side verification
      const isValid = await verifyBadge(badge);
      if (!isValid) {
        setError('Invalid signature. Badge verification failed.');
        setIsSubmitting(false);
        return;
      }

      // Store badge and show identity choice
      setVerifiedBadge(badge);
      setShowIdentityChoice(true);
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to verify badge');
      setIsSubmitting(false);
    }
  };

  // Normalize URL to ensure it has a protocol
  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    
    // Check if URL already has a protocol
    if (trimmed.match(/^https?:\/\//i)) {
      return trimmed;
    }
    
    // Add https:// by default
    return `https://${trimmed}`;
  };

  const handleIdentityChoice = async () => {
    if (!verifiedBadge) return;
    
    // Validate input if not anonymous
    if (!isAnonymous && !website.trim()) {
      setError('Please enter a website or select anonymous');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const identityMode = isAnonymous ? 'anonymous' : 'public';
      
      // Set the joined group based on which button was clicked
      verifiedBadge.joinedGroup = targetGroup || undefined;
      
      // If public mode, set the display name from website input (normalized)
      if (identityMode === 'public' && website.trim()) {
        verifiedBadge.displayName = normalizeUrl(website);
      }

      // Submit to backend
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifiedBadge),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit badge');
      }

      // Create verified profile for localStorage
      const profile: VerifiedProfile = {
        did: verifiedBadge.did,
        metrics: verifiedBadge.metrics,
        publicKey: verifiedBadge.publicKey,
        signature: verifiedBadge.signature,
        timestamp: verifiedBadge.timestamp,
        verifiedAt: new Date().toISOString(),
        identityMode,
        displayName: identityMode === 'public' ? normalizeUrl(website) : undefined,
        joinedGroups: targetGroup ? [targetGroup] : [],
      };

      // Save to localStorage
      saveVerifiedProfile(profile);

      // Determine which groups user joined for display
      const groups: string[] = [];
      if (targetGroup === 'exact-numbers') {
        groups.push('Exact Numbers Leaderboard');
      } else if (targetGroup === '10-mrr-club') {
        groups.push('>$10 MRR Club');
      }
      
      setJoinedGroups(groups);
      setSuccess(true);
      setInput('');
      setWebsite('');
      setIsAnonymous(false);
      
      // Notify parent component
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const handleClose = () => {
    setInput('');
    setError(null);
    setSuccess(false);
    setJoinedGroups([]);
    setShowInstructions(true);
    setShowIdentityChoice(false);
    setVerifiedBadge(null);
    setWebsite('');
    setIsAnonymous(false);
    onOpenChange(false);
  };

  // Get the display name for the target group
  const getTargetGroupName = () => {
    if (targetGroup === 'exact-numbers') return 'Exact Numbers Leaderboard';
    if (targetGroup === '10-mrr-club') return '>$10 MRR Club';
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
        <DialogHeader>
          {showInstructions && !success && !showIdentityChoice ? (
            <>
              <DialogTitle className="text-2xl">Verify Your Revenue Privately</DialogTitle>
              <DialogDescription className="text-gray-400">
                Generate a verification.json file using our CLI. No Stripe data ever leaves your device.
              </DialogDescription>
            </>
          ) : !success && !showIdentityChoice ? (
            <>
              <DialogTitle className="text-2xl">Upload Your Verification File</DialogTitle>
              <DialogDescription className="text-gray-400">
                Paste your verification.json or upload the file:
              </DialogDescription>
            </>
          ) : showIdentityChoice && !success ? (
            <>
              <DialogTitle className="text-2xl">Choose Your Identity</DialogTitle>
              <DialogDescription className="text-gray-400">
                How do you want to appear on leaderboards?
              </DialogDescription>
            </>
          ) : null}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {showIdentityChoice && !success ? (
            <>
              <div className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                      Website <span className="text-gray-500">(clickable on leaderboards)</span>
                    </label>
                    <input
                      id="website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={isAnonymous}
                      placeholder="example.com or https://example.com"
                      className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-black/50 border border-gray-800 rounded-lg">
                    <input
                      id="anonymous"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-2 focus:ring-purple-600 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="anonymous" className="flex-1 text-sm text-gray-300 cursor-pointer">
                      Verify as anonymous
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleIdentityChoice}
                  disabled={isSubmitting || (!isAnonymous && !website.trim())}
                  className="w-full bg-primary hover:bg-primary-dark text-primary-foreground disabled:bg-gray-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Continue'}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowIdentityChoice(false);
                      setVerifiedBadge(null);
                      setWebsite('');
                      setIsAnonymous(false);
                    }}
                    className="text-sm text-gray-400 hover:text-gray-300"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </>
          ) : showInstructions && !success ? (
            <>
              <div className="space-y-4">
                <div className="bg-black p-4 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">Run this command in your terminal:</p>
                  <code className="text-purple-400 font-mono text-sm block">
                    npx ghostmrr@latest verify
                  </code>
                </div>

                <Button
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  I have my verification.json →
                </Button>
              </div>
            </>
          ) : !success ? (
            <>
              <div className="mb-2">
                <Button
                  onClick={() => setShowInstructions(true)}
                  variant="ghost"
                  className="text-sm text-gray-400 hover:text-gray-300 p-0 h-auto"
                >
                  ← Back
                </Button>
              </div>

              <textarea
                className="w-full h-64 p-4 bg-black border border-gray-800 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder='{\n  "did": "did:key:z6Mkf...",\n  "metrics": { ... },\n  ...\n}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <div className="flex items-center justify-center">
                <span className="text-gray-500 text-sm">or</span>
              </div>

              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full p-2 bg-black border border-gray-800 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark"
              />

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={isSubmitting || !input}
                className="w-full bg-primary hover:bg-primary-dark text-primary-foreground disabled:bg-gray-700"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Badge'}
              </Button>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h3 className="text-2xl font-bold text-green-500">Badge Verified!</h3>
              <p className="text-gray-300">
                {getTargetGroupName() ? (
                  <>You've joined the <strong>{getTargetGroupName()}</strong>!</>
                ) : joinedGroups.length > 0 ? (
                  <>You've joined: <strong>{joinedGroups.join(', ')}</strong></>
                ) : (
                  'Your badge has been verified successfully!'
                )}
              </p>
              <Button onClick={handleClose} className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

