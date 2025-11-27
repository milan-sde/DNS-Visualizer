// app/api/lookup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DNSLookupService } from '@/lib/dnsUtils';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { domain, resolver = 'cloudflare' } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    const result = await DNSLookupService.lookupDomain(domain, resolver);

    // Store in database
    await query(
      `INSERT INTO lookups (domain, record_type, resolver, result_json, latency_ms, ttl, cache_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        domain,
        'multiple',
        result.resolver,
        JSON.stringify(result),
        result.latency,
        Math.min(...result.records.map(r => r.ttl || 3600)),
        result.cacheStatus
      ]
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lookup failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT * FROM lookups WHERE domain = $1 ORDER BY created_at DESC LIMIT 10`,
      [domain]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}