'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast';
import MemberRow from './MemberRow';
import { VerifiedProfile } from '@/lib/types/verification';
import { checkGroupEligibility, hasJoinedGroup, addGroupToProfile } from '@/lib/localStorage/verifiedProfile';

interface Member {
  rank: number;
  did: string;
  displayName?: string;
  mrr: string | number;
  verifiedAt: string;
}

interface GroupCardProps {
  icon: string;
  title: string;
  description: string;
  memberCount: number;
  members: Member[];
  slug: string;
  showExact?: boolean;
  verifiedProfile: VerifiedProfile | null;
  onVerifyClick: () => void;
  onJoinSuccess?: () => void;
}

const MAX_VISIBLE_MEMBERS = 5;

export default function GroupCard({
  icon,
  title,
  description,
  memberCount,
  members,
  slug,
  showExact = false,
  verifiedProfile,
  onVerifyClick,
  onJoinSuccess,
}: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { addToast } = useToast();
  const visibleMembers = isExpanded ? members : members.slice(0, MAX_VISIBLE_MEMBERS);
  const hasMoreMembers = members.length > MAX_VISIBLE_MEMBERS;
  const remainingCount = members.length - MAX_VISIBLE_MEMBERS;

  const groupSlug = slug as 'exact-numbers' | '10-mrr-club';
  const isVerified = !!verifiedProfile;
  const alreadyJoined = hasJoinedGroup(groupSlug);
  const eligibility = checkGroupEligibility(verifiedProfile, groupSlug);

  const handleJoinClick = async () => {
    // If not verified, open verification dialog
    if (!isVerified) {
      onVerifyClick();
      return;
    }

    // If already joined, show message
    if (alreadyJoined) {
      addToast({
        title: 'Already a member',
        description: `You're already in ${title}`,
        variant: 'default',
      });
      return;
    }

    // Check eligibility
    if (!eligibility.eligible) {
      addToast({
        title: 'Not eligible',
        description: eligibility.reason || 'You do not meet the requirements for this group',
        variant: 'error',
      });
      return;
    }

    // Join group
    setIsJoining(true);
    try {
      // Submit to backend
      const badge = {
        did: verifiedProfile.did,
        metrics: verifiedProfile.metrics,
        publicKey: verifiedProfile.publicKey,
        signature: verifiedProfile.signature,
        timestamp: verifiedProfile.timestamp,
        accountHash: verifiedProfile.accountHash,
        displayName: verifiedProfile.displayName,
        joinedGroup: groupSlug,
      };

      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badge),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join group');
      }

      // Update localStorage
      addGroupToProfile(groupSlug);

      // Show success
      addToast({
        title: 'Success!',
        description: `You've joined ${title}`,
        variant: 'success',
      });

      // Notify parent
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to join group',
        variant: 'error',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200 hover:shadow-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title}
          </CardTitle>
          <Button 
            onClick={handleJoinClick} 
            size="sm" 
            disabled={isJoining || alreadyJoined}
            className={`${alreadyJoined ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-dark'} text-primary-foreground`}
          >
            {isJoining ? 'Joining...' : alreadyJoined ? '✓ Joined' : 'Join'}
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <Separator className="bg-border" />
        
        <div className="space-y-1">
          {visibleMembers.map((member) => (
            <MemberRow
              key={member.did}
              rank={member.rank}
              did={member.did}
              displayName={member.displayName}
              mrr={member.mrr}
              verifiedAt={member.verifiedAt}
              showExact={showExact}
            />
          ))}
        </div>
        
        {hasMoreMembers && (
          <div className="flex justify-center pt-2">
            <Button 
              variant="outline" 
              className="text-sm border-border hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : `Show More (${remainingCount})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

