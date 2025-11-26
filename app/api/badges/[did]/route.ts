import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verifyBadgeServer } from '@/lib/crypto/verifier-server';
import { VerificationBadge } from '@/lib/types/verification';

/**
 * GET /api/badges/[did]
 * Fetch a single badge by DID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { did: string } }
) {
  try {
    const { did } = params;

    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('did', did)
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
      did: data.did,
      metrics: {
        mrr: Number(data.mrr),
        customers: data.customers,
        tier: data.tier,
      },
      publicKey: data.public_key,
      signature: data.signature,
      timestamp: data.timestamp,
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
 * Update a badge by DID (verify signature and DID match)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { did: string } }
) {
  try {
    const { did } = params;
    const badge: VerificationBadge = await request.json();

    // Verify DID matches
    if (badge.did !== did) {
      return NextResponse.json(
        { error: 'DID mismatch' },
        { status: 400 }
      );
    }

    // Verify signature server-side
    const isValid = await verifyBadgeServer(badge);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature. Badge verification failed.' },
        { status: 400 }
      );
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
    };

    const { data, error } = await supabase
      .from('badges')
      .update(badgeData)
      .eq('did', did)
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

