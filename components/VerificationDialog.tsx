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
import { VerificationBadge } from '@/lib/types/verification';
import { verifyBadge } from '@/lib/crypto/verifier';

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VerificationDialog({ open, onOpenChange }: VerificationDialogProps) {
  const [showInstructions, setShowInstructions] = useState(true);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

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

      // Submit to backend
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badge),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit badge');
      }

      const data = await response.json();
      
      // Determine which groups user joined
      const groups: string[] = [];
      const mrr = badge.metrics.mrr;
      
      if (mrr >= 10) {
        groups.push('>$10 MRR Club');
      }
      
      // For exact numbers, check if they're revealing exact MRR
      if (badge.revealExact) {
        groups.push('Exact Numbers Leaderboard');
      }
      
      setJoinedGroups(groups);
      setSuccess(true);
      setInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to verify badge');
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
        <DialogHeader>
          {showInstructions && !success ? (
            <>
              <DialogTitle className="text-2xl">Verify Your Revenue Privately</DialogTitle>
              <DialogDescription className="text-gray-400">
                Generate a verification.json file using our CLI. No Stripe data ever leaves your device.
              </DialogDescription>
            </>
          ) : !success ? (
            <>
              <DialogTitle className="text-2xl">Upload Your Verification File</DialogTitle>
              <DialogDescription className="text-gray-400">
                Paste your verification.json or upload the file:
              </DialogDescription>
            </>
          ) : null}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {showInstructions && !success ? (
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
                {joinedGroups.length > 0 ? (
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

