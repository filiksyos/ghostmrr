import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verifyBadgeServer } from '@/lib/crypto/verifier-server';
import { VerificationBadge } from '@/lib/types/verification';

/**
 * GET /api/badges
 * Fetch all badges, sorted by MRR descending
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('mrr', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      );
    }

    // Convert database format to VerificationBadge format
    const badges: VerificationBadge[] = (data || []).map((row: any) => ({
      did: row.did,
      metrics: {
        mrr: Number(row.mrr),
        customers: row.customers,
        tier: row.tier,
      },
      publicKey: row.public_key,
      signature: row.signature,
      timestamp: row.timestamp,
      displayName: row.display_name,
      revealExact: row.reveal_exact,
      joinedGroups: row.joined_groups || [],
    }));

    return NextResponse.json({ badges });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/badges
 * Submit a new badge (verify signature server-side before storing)
 */
export async function POST(request: NextRequest) {
  try {
    const badge: VerificationBadge = await request.json();

    // Verify signature server-side
    const isValid = await verifyBadgeServer(badge);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature. Badge verification failed.' },
        { status: 400 }
      );
    }

    // Check if badge with this DID already exists
    const { data: existing, error: checkError } = await supabase
      .from('badges')
      .select('did, joined_groups')
      .eq('did', badge.did)
      .maybeSingle();

    // Calculate joined_groups array
    let joinedGroupsArray: string[] = [];
    if (existing && !checkError && existing.joined_groups) {
      joinedGroupsArray = [...existing.joined_groups];
    }
    
    // Add the new group if specified and not already present
    if (badge.joinedGroup && !joinedGroupsArray.includes(badge.joinedGroup)) {
      joinedGroupsArray.push(badge.joinedGroup);
    }

    // Prepare data for database
    const badgeData = {
      did: badge.did,
      mrr: badge.metrics.mrr,
      customers: badge.metrics.customers,
      tier: badge.metrics.tier,
      public_key: badge.publicKey,
      signature: badge.signature,
      timestamp: badge.timestamp,
      display_name: badge.displayName || null,
      reveal_exact: badge.revealExact || false,
      joined_groups: joinedGroupsArray,
    };

    let result;
    if (existing && !checkError) {
      // Update existing badge
      const { data, error } = await supabase
        .from('badges')
        .update(badgeData)
        .eq('did', badge.did)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json(
          { error: 'Failed to update badge' },
          { status: 500 }
        );
      }

      result = { badge: data, isUpdate: true };
    } else {
      // Insert new badge
      const { data, error } = await supabase
        .from('badges')
        .insert(badgeData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json(
          { error: 'Failed to insert badge' },
          { status: 500 }
        );
      }

      result = { badge: data, isUpdate: false };
    }

    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

