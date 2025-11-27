// app/api/compare/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DNSLookupService } from '@/lib/dnsUtils';

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const results = await DNSLookupService.compareResolvers(domain);
    
    return NextResponse.json({
      domain,
      comparisons: results
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Comparison failed' },
      { status: 500 }
    );
  }
}