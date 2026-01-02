'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StripeVerificationForm from '@/components/StripeVerificationForm';

export default function VerifyPage() {
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleVerificationComplete = () => {
    setSuccess(true);

    // Redirect to leaderboard after a short delay
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Verify Your Revenue</h1>
        <p className="text-gray-400 mb-8">
          Connect your Stripe account to verify your MRR and join the leaderboard.
          Your API key never leaves your browser.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          {!success ? (
            <StripeVerificationForm
              targetGroup={null}
              onVerificationComplete={handleVerificationComplete}
            />
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-green-500">Verification Complete!</h2>
              <p className="text-gray-300">
                Your badge has been added to the leaderboard.
              </p>
              <p className="text-sm text-gray-400">
                Redirecting you to the leaderboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
