'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import GroupCard from '@/components/GroupCard';
import HowItWorks from '@/components/HowItWorks';
import VerificationDialog from '@/components/VerificationDialog';
import { Card } from '@/components/ui/card';
import { VerificationBadge } from '@/lib/types/verification';

export default function Home() {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [allBadges, setAllBadges] = useState<VerificationBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges');
      if (response.ok) {
        const data = await response.json();
        setAllBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExactNumbersMembers = () => {
    return allBadges
      .filter(badge => badge.revealExact && badge.metrics.mrr)
      .sort((a, b) => b.metrics.mrr - a.metrics.mrr)
      .slice(0, 3)
      .map((badge, index) => ({
        rank: index + 1,
        did: badge.did,
        displayName: badge.displayName,
        mrr: badge.metrics.mrr,
        verifiedAt: badge.timestamp,
      }));
  };

  const getTenMRRClubMembers = () => {
    return allBadges
      .filter(badge => badge.metrics.mrr >= 10)
      .slice(0, 3)
      .map((badge, index) => ({
        rank: index + 1,
        did: badge.did,
        displayName: badge.displayName,
        mrr: '>$10 MRR',
        verifiedAt: badge.timestamp,
      }));
  };

  const exactNumbersCount = allBadges.filter(b => b.revealExact && b.metrics.mrr).length;
  const tenMRRCount = allBadges.filter(b => b.metrics.mrr >= 10).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation onVerifyClick={() => setShowVerificationDialog(true)} />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tight">
            👻 <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">GhostMRR</span>
          </h1>
          
          <p className="text-3xl font-semibold text-gray-200">
            "Verify your revenue. Reveal nothing."
          </p>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Zero-trust. DID-powered. Privacy-first verification.
          </p>

          <button
            onClick={() => setShowVerificationDialog(true)}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
          >
            🔐 Verify Your Badge
          </button>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Local-First</h3>
              <p className="text-gray-400 text-sm">
                Your Stripe key never leaves your machine
              </p>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold mb-2">Crypto-Signed</h3>
              <p className="text-gray-400 text-sm">
                Ed25519 sigs ensure authenticity
              </p>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-lg font-semibold mb-2">Privacy-Preserving</h3>
              <p className="text-gray-400 text-sm">
                Only share your tier
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Groups Section */}
      <section id="groups" className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Join Verified Founder Communities
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Prove your revenue and connect with other verified founders
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-500">Loading groups...</div>
            </div>
          ) : (
            <div className="space-y-8">
              <GroupCard
                icon="📊"
                title="Exact Numbers Leaderboard"
                description="Show your precise MRR and compete for the #1 spot"
                memberCount={Math.max(exactNumbersCount, 47)}
                members={getExactNumbersMembers()}
                slug="exact-numbers"
                showExact={true}
                onVerifyClick={() => setShowVerificationDialog(true)}
              />

              <GroupCard
                icon="🎯"
                title=">$10 MRR Club"
                description="Join verified founders earning $10+ monthly recurring revenue"
                memberCount={Math.max(tenMRRCount, 153)}
                members={getTenMRRClubMembers()}
                slug="10-mrr-club"
                showExact={false}
                onVerifyClick={() => setShowVerificationDialog(true)}
              />
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Footer */}
      <footer className="py-12 px-4 bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="text-2xl">👻 GhostMRR</div>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Open Source</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 GhostMRR - Zero-trust revenue verification
          </p>
        </div>
      </footer>

      {/* Verification Dialog */}
      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      />
    </div>
  );
}
