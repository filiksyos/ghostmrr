'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import GroupCard from '@/components/GroupCard';
import HowItWorks from '@/components/HowItWorks';
import VerificationDialog from '@/components/VerificationDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      .map((badge, index) => ({
        rank: index + 1,
        did: badge.did,
        displayName: badge.displayName,
        mrr: '>$10 MRR',
        verifiedAt: badge.timestamp,
      }));
  };

  const exactNumbersMembers = getExactNumbersMembers();
  const tenMRRMembers = getTenMRRClubMembers();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            <span className="block">Join verified startup groups.</span>
            <span className="block text-primary">without revealing your data</span>
          </h1>

          <div className="pt-2">
            <Button onClick={() => setShowVerificationDialog(true)} className="bg-primary hover:bg-primary-dark text-primary-foreground">
              Verify Startup
            </Button>
          </div>
        </div>
      </section>

      {/* Groups Section */}
      <section id="groups" className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-500">Loading groups...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GroupCard
                icon=""
                title="Exact Numbers Leaderboard"
                description="Show your precise MRR and compete for the #1 spot"
                memberCount={exactNumbersMembers.length}
                members={exactNumbersMembers}
                slug="exact-numbers"
                showExact={true}
                onVerifyClick={() => setShowVerificationDialog(true)}
              />

              <GroupCard
                icon=""
                title=">$10 MRR Club"
                description="Join verified founders earning $10+ monthly recurring revenue"
                memberCount={tenMRRMembers.length}
                members={tenMRRMembers}
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
      <footer className="bg-background border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Built by <a href="https://github.com/filiksyos" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Filiksyos</a> with GitMVP
          </p>
          <button
            onClick={() => {
              const html = document.documentElement;
              const isDark = html.classList.contains('dark');
              if (isDark) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              }
            }}
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-md border border-border"
            aria-label="Toggle theme"
          >
            <span className="sr-only">Toggle theme</span>
            <svg className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
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
