'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MemberRow from '@/components/MemberRow';
import VerificationDialog from '@/components/VerificationDialog';
import { VerificationBadge } from '@/lib/types/verification';
import { ArrowLeft } from 'lucide-react';

const GROUP_CONFIG = {
  'exact-numbers': {
    icon: '📊',
    title: 'Exact Numbers Leaderboard',
    description: 'Show your precise MRR and compete for the #1 spot',
    showExact: true,
    filter: (badge: VerificationBadge) => badge.revealExact && badge.metrics.mrr > 0,
  },
  '10-mrr-club': {
    icon: '🎯',
    title: '>$10 MRR Club',
    description: 'Join verified founders earning $10+ monthly recurring revenue',
    showExact: false,
    filter: (badge: VerificationBadge) => badge.metrics.mrr >= 10,
  },
};

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const config = GROUP_CONFIG[slug as keyof typeof GROUP_CONFIG];

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges');
      if (response.ok) {
        const data = await response.json();
        const allBadges = data.badges || [];
        
        let filtered = config ? allBadges.filter(config.filter) : [];
        
        if (slug === 'exact-numbers') {
          filtered = filtered.sort((a: VerificationBadge, b: VerificationBadge) => b.metrics.mrr - a.metrics.mrr);
        }
        
        setBadges(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Group Not Found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 hover:bg-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
            <span>{config.icon}</span>
            <span>{config.title}</span>
          </h1>
          <p className="text-gray-400 text-lg">{config.description}</p>
          <p className="text-gray-500 mt-2">Members: {badges.length}</p>
        </div>

        <Card className="bg-gray-900 border-gray-800 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-500">Loading members...</div>
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No verified members yet. Be the first!</p>
              <Button
                onClick={() => setShowVerificationDialog(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                🔒 Verify to Join
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {badges.map((badge, index) => (
                <MemberRow
                  key={badge.did}
                  rank={index + 1}
                  did={badge.did}
                  displayName={badge.displayName}
                  mrr={config.showExact ? badge.metrics.mrr : '>$10 MRR'}
                  verifiedAt={badge.timestamp}
                  showExact={config.showExact}
                />
              ))}
            </div>
          )}
        </Card>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setShowVerificationDialog(true)}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg"
          >
            🔒 Verify to Join
          </Button>
        </div>
      </div>

      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      />
    </div>
  );
}

