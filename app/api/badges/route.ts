import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
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
      accountHash: row.account_hash,
      metrics: {
        mrr: Number(row.mrr),
        customers: row.customers,
        tier: row.tier,
      },
      timestamp: row.timestamp,
      displayName: row.display_name,
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
 * Submit a new badge (validate badge structure before storing)
 */
export async function POST(request: NextRequest) {
  try {
    const badge: VerificationBadge = await request.json();

    // Validate badge structure
    if (!badge.accountHash || typeof badge.accountHash !== 'string' || badge.accountHash.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid account hash' },
        { status: 400 }
      );
    }

    if (!badge.metrics ||
        typeof badge.metrics.mrr !== 'number' ||
        typeof badge.metrics.customers !== 'number' ||
        typeof badge.metrics.tier !== 'string') {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    if (!badge.timestamp) {
      return NextResponse.json(
        { error: 'Timestamp is required' },
        { status: 400 }
      );
    }

    const timestampValidation = new Date(badge.timestamp);
    if (isNaN(timestampValidation.getTime())) {
      return NextResponse.json(
        { error: 'Invalid timestamp format' },
        { status: 400 }
      );
    }

    // Check if badge with this account_hash already exists (primary deduplication key)
    const checkResult = await supabase
      .from('badges')
      .select('account_hash, joined_groups, timestamp')
      .eq('account_hash', badge.accountHash)
      .maybeSingle();

    const existing = checkResult.data;
    const checkError = checkResult.error;

    // Timestamp validation: reject if submitted verification is older
    // Equal timestamps are allowed (e.g., joining groups with same verification.json)
    // If a verification.json is compromised, user can generate a newer one to invalidate it
    if (existing && !checkError) {
      const existingTimestamp = new Date(existing.timestamp).getTime();
      const newTimestamp = new Date(badge.timestamp).getTime();

      if (newTimestamp < existingTimestamp) {
        return NextResponse.json(
          { error: 'This verification is outdated. Please generate a fresh verification with the latest data.' },
          { status: 400 }
        );
      }
    }

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
      account_hash: badge.accountHash,
      mrr: badge.metrics.mrr,
      customers: badge.metrics.customers,
      tier: badge.metrics.tier,
      timestamp: badge.timestamp,
      display_name: badge.displayName || null,
      reveal_exact: badge.revealExact || false,
      joined_groups: joinedGroupsArray,
    };

    let result;
    if (existing && !checkError) {
      // Update existing badge using account_hash
      const { data, error } = await supabase
        .from('badges')
        .update(badgeData)
        .eq('account_hash', badge.accountHash)
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

