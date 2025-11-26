'use client';

import { useEffect, useState } from 'react';
import { VerificationBadge } from '@/lib/types/verification';
import VerificationBadgeComponent from '@/components/VerificationBadge';

export default function LeaderboardPage() {
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/badges');
        
        if (!response.ok) {
          throw new Error('Failed to fetch badges');
        }
        
        const data = await response.json();
        setBadges(data.badges || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard');
        console.error('Error fetching badges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Verified Founders Leaderboard</h1>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-xl">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg inline-block">
              <p className="text-red-400">❌ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-xl">No verified badges yet.</p>
            <p className="mt-4">Be the first to verify your MRR!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {badges.map((badge, index) => (
              <div key={badge.did} className="relative">
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
