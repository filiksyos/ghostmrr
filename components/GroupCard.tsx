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
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:translate-y-[-4px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <span>{icon}</span>
            <span>{title}</span>
          </CardTitle>
          <span className="text-sm text-gray-400">Members: {memberCount}</span>
        </div>
        <Separator className="my-2 bg-gray-800" />
        <CardDescription className="text-gray-300">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
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
        
        <div className="flex gap-3 pt-4">
          <Link href={`/groups/${slug}`} className="flex-1">
            <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
              👀 Show More ({remainingCount} startups)
            </Button>
          </Link>
          <Button onClick={onVerifyClick} className="flex-1 bg-purple-600 hover:bg-purple-700">
            🔒 Verify to Join
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

