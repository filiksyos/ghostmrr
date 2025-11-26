'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MemberRow from './MemberRow';
import Link from 'next/link';

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
  const remainingCount = memberCount - members.length;

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
          {members.map((member) => (
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
        
        <div className="flex justify-center pt-2">
          <Link href={`/groups/${slug}`}>
            <Button variant="outline" className="text-sm border-border hover:bg-accent hover:text-accent-foreground">
              Show More ({remainingCount})
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

