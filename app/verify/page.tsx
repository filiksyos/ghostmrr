'use client';

import { useState } from 'react';
import { VerificationBadge } from '@/lib/types/verification';
import { verifyBadge } from '@/lib/crypto/verifier';
import VerificationBadgeComponent from '@/components/VerificationBadge';

export default function VerifyPage() {
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
          <div>
            <label className="block text-sm font-medium mb-2">
              Paste your verification.json:
            </label>
            <textarea
              className="w-full h-64 p-4 bg-gray-900 rounded-lg font-mono text-sm"
              placeholder='{\n  "did": "did:key:z6Mkf...",\n  "metrics": { ... },\n  ...\n}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
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
        </div>
      </div>
    </div>
  );
}
