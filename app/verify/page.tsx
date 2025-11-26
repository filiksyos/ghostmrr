'use client';

import { useState } from 'react';
import { VerificationBadge } from '@/lib/types/verification';
import { verifyBadge } from '@/lib/crypto/verifier';
import VerificationBadgeComponent from '@/components/VerificationBadge';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [input, setInput] = useState('');
  const [badge, setBadge] = useState<VerificationBadge | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setIsValid(null);
    setBadge(null);
    setIsUpdate(false);

    try {
      const parsedBadge: VerificationBadge = JSON.parse(input);
      
      // Client-side verification (instant feedback)
      const valid = await verifyBadge(parsedBadge);
      setBadge(parsedBadge);
      setIsValid(valid);

      if (valid) {
        // Submit to API for server-side verification and storage
        setIsSubmitting(true);
        try {
          const response = await fetch('/api/badges', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedBadge),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to submit badge');
          }

          setIsUpdate(data.isUpdate || false);
        } catch (apiError: any) {
          setError(`Failed to submit badge: ${apiError.message}`);
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Verify Your Badge</h1>

        <div className="space-y-6">
          {showInstructions ? (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Verify Your Revenue Privately</h2>
                  <p className="text-gray-400 mb-6">
                    Generate a verification.json file using our CLI. No Stripe data ever leaves your device.
                  </p>
                </div>

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
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-2">Upload Your Verification File</h2>
                <p className="text-gray-400 mb-6">
                  Paste your verification.json or upload the file:
                </p>
              </div>

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
                className="w-full h-64 p-4 bg-gray-900 rounded-lg font-mono text-sm"
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const content = e.target?.result as string;
                      setInput(content);
                    };
                    reader.readAsText(file);
                  }
                }}
                className="w-full p-2 bg-gray-900 border border-gray-800 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark"
              />

              <button
                onClick={handleVerify}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-primary-foreground disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Verify Badge'}
              </button>

              {error && (
                <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg">
                  <p className="text-red-400">❌ {error}</p>
                </div>
              )}

              {isValid === false && (
                <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg">
                  <p className="text-red-400">❌ Invalid signature! Badge may be tampered.</p>
                </div>
              )}

              {isValid === true && badge && !isSubmitting && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/50 border border-green-600 rounded-lg">
                    <p className="text-green-400">
                      ✅ Signature verified! Badge is authentic.
                      {isUpdate && (
                        <span className="block mt-2 text-sm text-green-300">
                          ℹ️ Updated existing badge for this DID in the leaderboard.
                        </span>
                      )}
                      {!isUpdate && !error && (
                        <span className="block mt-2 text-sm text-green-300">
                          ✅ Badge submitted to leaderboard successfully!
                        </span>
                      )}
                    </p>
                  </div>
                  <VerificationBadgeComponent badge={badge} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
