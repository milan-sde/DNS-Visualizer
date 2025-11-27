// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '24h';
    
    // Calculate time intervals
    const intervals = getTimeInterval(timeRange);
    
    // Execute all analytics queries in parallel
    const [
      totalLookupsResult,
      latencyResult,
      cacheStatsResult,
      topDomainsResult,
      resolverStatsResult,
      recentLookupsResult,
      latencyTrendResult,
      recordTypesResult
    ] = await Promise.all([
      getTotalLookups(intervals),
      getLatencyStats(intervals),
      getCacheStats(intervals),
      getTopDomains(intervals),
      getResolverStats(intervals),
      getRecentLookups(),
      getLatencyTrend(intervals),
      getRecordTypeStats(intervals)
    ]);

    const cacheHitRate = calculateCacheHitRate(cacheStatsResult.rows);

    const response = {
      totalLookups: totalLookupsResult.rows[0]?.count || 0,
      averageLatency: Math.round(latencyResult.rows[0]?.avg_latency || 0),
      cacheHitRate,
      topDomains: topDomainsResult.rows.map(row => ({
        domain: row.domain,
        count: parseInt(row.count),
        latency: Math.round(parseFloat(row.avg_latency || 0))
      })),
      cacheDistribution: [
        { name: 'Live', value: cacheStatsResult.rows.find(r => r.cache_status === 'live')?.count || 0, color: '#00C49F' },
        { name: 'Cached', value: cacheStatsResult.rows.find(r => r.cache_status === 'cached')?.count || 0, color: '#0088FE' },
        { name: 'Stale', value: cacheStatsResult.rows.find(r => r.cache_status === 'stale')?.count || 0, color: '#FF8042' }
      ].filter(item => item.value > 0),
      latencyTrend: latencyTrendResult.rows.map(row => ({
        time: formatTimeLabel(row.time_bucket, timeRange),
        latency: Math.round(parseFloat(row.avg_latency || 0))
      })),
      resolverStats: resolverStatsResult.rows.map(row => ({
        resolver: getResolverName(row.resolver),
        requests: parseInt(row.count),
        avgLatency: Math.round(parseFloat(row.avg_latency || 0))
      })),
      recentLookups: recentLookupsResult.rows.map(row => ({
        domain: row.domain,
        latency: row.latency_ms,
        status: row.cache_status,
        timestamp: formatTimeAgo(row.created_at)
      })),
      recordTypeStats: recordTypesResult.rows.map(row => ({
        type: row.record_type,
        count: parseInt(row.count),
        color: getRecordTypeColor(row.record_type)
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Helper functions
function getTimeInterval(range: string) {
  const now = new Date();
  switch (range) {
    case '1h':
      return { interval: '1 hour', points: 12, format: 'HH24:MI' };
    case '24h':
      return { interval: '24 hours', points: 24, format: 'HH24:00' };
    case '7d':
      return { interval: '7 days', points: 7, format: 'Mon' };
    case '30d':
      return { interval: '30 days', points: 30, format: 'MM/DD' };
    default:
      return { interval: '24 hours', points: 24, format: 'HH24:00' };
  }
}

function formatTimeLabel(timeBucket: string, range: string): string {
  if (range === '24h' || range === '1h') {
    return timeBucket; // Already formatted as time
  }
  return timeBucket; // For days, return as-is
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return time.toLocaleDateString();
}

function getResolverName(resolverIp: string): string {
  const resolvers: { [key: string]: string } = {
    '1.1.1.1': 'Cloudflare',
    '8.8.8.8': 'Google',
    '9.9.9.9': 'Quad9',
    '8.8.4.4': 'Google',
    '1.0.0.1': 'Cloudflare'
  };
  return resolvers[resolverIp] || resolverIp;
}

function getRecordTypeColor(recordType: string): string {
  const colors: { [key: string]: string } = {
    'A': '#0088FE',
    'AAAA': '#00C49F',
    'MX': '#FFBB28',
    'CNAME': '#FF8042',
    'NS': '#8884D8',
    'TXT': '#82CA9D',
    'SOA': '#FF6B6B',
    'multiple': '#4ECDC4'
  };
  return colors[recordType] || '#999999';
}

function calculateCacheHitRate(cacheStats: any[]): number {
  const cached = cacheStats.find(stat => stat.cache_status === 'cached')?.count || 0;
  const total = cacheStats.reduce((sum, stat) => sum + parseInt(stat.count || 0), 0);
  return total > 0 ? Math.round((cached / total) * 100) : 0;
}

// Database query functions
async function getTotalLookups(intervals: any) {
  return query(
    `SELECT COUNT(*) as count 
     FROM lookups 
     WHERE created_at >= NOW() - INTERVAL '${intervals.interval}'`
  );
}

async function getLatencyStats(intervals: any) {
  return query(
    `SELECT AVG(latency_ms) as avg_latency 
     FROM lookups 
     WHERE created_at >= NOW() - INTERVAL '${intervals.interval}'`
  );
}

async function getCacheStats(intervals: any) {
  return query(
    `SELECT cache_status, COUNT(*) as count 
     FROM lookups 
     WHERE created_at >= NOW() - INTERVAL '${intervals.interval}'
     GROUP BY cache_status`
  );
}

async function getTopDomains(intervals: any) {
  return query(
    `SELECT domain, COUNT(*) as count, AVG(latency_ms) as avg_latency 
     FROM lookups 
     WHERE created_at >= NOW() - INTERVAL '${intervals.interval}'
     GROUP BY domain 
     ORDER BY count DESC 
     LIMIT 10`
  );
}

async function getResolverStats(intervals: any) {
  return query(
    `SELECT resolver, COUNT(*) as count, AVG(latency_ms) as avg_latency 
     FROM lookups 
     WHERE created_at >= NOW() - INTERVAL '${intervals.interval}'
     GROUP BY resolver 
     ORDER BY count DESC`
  );
}

async function getRecentLookups() {
  return query(
    `SELECT domain, latency_ms, cache_status, created_at 
     FROM lookups 
     ORDER BY created_at DESC 
     LIMIT 10`
  );
}

async function getLatencyTrend(intervals: any) {
  let timeBucket;
  switch (intervals.interval) {
    case '1 hour':
      timeBucket = `TO_CHAR(created_at, '${intervals.format}')`;
      break;
    case '24 hours':
      timeBucket = `TO_CHAR(created_at, '${intervals.format}')`;
      break;
    case '7 days':
      timeBucket = `TO_CHAR(created_at, '${intervals.format}')`;
      break;
    case '30 days':
      timeBucket = `TO_CHAR(created_at, '${intervals.format}')`;
      break;
    default:
      timeBucket = `TO_CHAR(created_at, 'HH24:00')`;
  }

  return query(
    `SELECT ${timeBucket} as time_bucket, AVG(latency_ms) as avg_latency 
     FROM lookups 
     WHERE created_at >= NOW() - INTERVAL '${intervals.interval}'
     GROUP BY time_bucket 
     ORDER BY time_bucket`
  );
}

async function getRecordTypeStats(intervals: any) {
  return query(
    `SELECT record_type, COUNT(*) as count 
     FROM lookups 
     WHERE created_at >= NOW() - INTERVAL '${intervals.interval}'
     GROUP BY record_type 
     ORDER BY count DESC`
  );
}