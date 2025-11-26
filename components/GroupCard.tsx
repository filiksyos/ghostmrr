'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MemberRow from './MemberRow';

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
  onVerifyClick: () => void;
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
  onVerifyClick,
}: GroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleMembers = isExpanded ? members : members.slice(0, MAX_VISIBLE_MEMBERS);
  const hasMoreMembers = members.length > MAX_VISIBLE_MEMBERS;
  const remainingCount = members.length - MAX_VISIBLE_MEMBERS;

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200 hover:shadow-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {title}
          </CardTitle>
          <Button onClick={onVerifyClick} size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground">
            Join
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

