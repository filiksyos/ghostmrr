import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { VerificationBadge } from '@/lib/types/verification';

/**
 * GET /api/badges/[did]
 * Fetch a single badge by accountHash (route param still named 'did' for backward compatibility)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ did: string }> }
) {
  try {
    const { did } = await params;
    // Interpret the 'did' parameter as accountHash
    const accountHash = did;

    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('account_hash', accountHash)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Badge not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch badge' },
        { status: 500 }
      );
    }

    // Convert database format to VerificationBadge format
    const badge: VerificationBadge = {
      accountHash: data.account_hash,
      metrics: {
        mrr: Number(data.mrr),
        customers: data.customers,
        tier: data.tier,
      },
      timestamp: data.timestamp,
      displayName: data.display_name,
      joinedGroups: data.joined_groups || [],
    };

    return NextResponse.json({ badge });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/badges/[did]
 * Update a badge by accountHash (validate badge structure and accountHash match)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ did: string }> }
) {
  try {
    const { did } = await params;
    // Interpret the 'did' parameter as accountHash
    const accountHash = did;
    const badge: VerificationBadge = await request.json();

    // Verify accountHash matches
    if (badge.accountHash !== accountHash) {
      return NextResponse.json(
        { error: 'Account hash mismatch' },
        { status: 400 }
      );
    }

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

    // Prepare data for database
    const badgeData = {
      account_hash: badge.accountHash,
      mrr: badge.metrics.mrr,
      customers: badge.metrics.customers,
      tier: badge.metrics.tier,
      timestamp: badge.timestamp,
      display_name: badge.displayName || null,
      reveal_exact: badge.revealExact || false,
      joined_groups: badge.joinedGroups || [],
    };

    const { data, error } = await supabase
      .from('badges')
      .update(badgeData)
      .eq('account_hash', accountHash)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Badge not found' },
          { status: 404 }
        );
      }
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update badge' },
        { status: 500 }
      );
    }

    return NextResponse.json({ badge: data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/badges/[did]
 * Delete a badge by accountHash
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ did: string }> }
) {
  try {
    const { did } = await params;
    // Interpret the 'did' parameter as accountHash
    const accountHash = did;

    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('account_hash', accountHash);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete badge' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

