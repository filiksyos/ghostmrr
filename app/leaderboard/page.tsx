'use client';

import { useEffect, useState } from 'react';
import { VerificationBadge } from '@/lib/types/verification';
import VerificationBadgeComponent from '@/components/VerificationBadge';

export default function LeaderboardPage() {
  const [badges, setBadges] = useState<VerificationBadge[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('verifiedBadges') || '[]';
    const parsed = JSON.parse(stored);
    
    // Sort by MRR descending
    parsed.sort((a: VerificationBadge, b: VerificationBadge) => b.metrics.mrr - a.metrics.mrr);
    
    setBadges(parsed);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Verified Founders Leaderboard</h1>

        {badges.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-xl">No verified badges yet.</p>
            <p className="mt-4">Be the first to verify your MRR!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {badges.map((badge, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-12 top-4 text-2xl font-bold text-gray-600">
                  #{index + 1}
                </div>
                <VerificationBadgeComponent badge={badge} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
