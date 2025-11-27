// lib/dnsUtils.ts
import dns from 'dns/promises';

export interface DNSRecord {
  type: string;
  value: string | string[];
  ttl?: number;
}

export interface LookupResult {
  domain: string;
  records: DNSRecord[];
  latency: number;
  resolver: string;
  cacheStatus: 'live' | 'cached' | 'stale';
  timestamp: Date;
}

export class DNSLookupService {
  private static readonly RESOLVERS = {
    google: '8.8.8.8',
    cloudflare: '1.1.1.1',
    quad9: '9.9.9.9'
  };

  static async lookupDomain(domain: string, resolver: keyof typeof this.RESOLVERS = 'cloudflare'): Promise<LookupResult> {
    const startTime = Date.now();
    const resolverIP = this.RESOLVERS[resolver];
    
    // Set custom resolver
    dns.setServers([resolverIP]);

    try {
      const records: DNSRecord[] = [];
      
      // Lookup different record types in parallel
      const lookups = await Promise.allSettled([
        this.lookupRecordType(domain, 'A'),
        this.lookupRecordType(domain, 'AAAA'),
        this.lookupRecordType(domain, 'MX'),
        this.lookupRecordType(domain, 'CNAME'),
        this.lookupRecordType(domain, 'NS'),
        this.lookupRecordType(domain, 'TXT'),
        this.lookupRecordType(domain, 'SOA')
      ]);

      lookups.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          records.push(result.value);
        }
      });

      const latency = Date.now() - startTime;
      
      // Simple cache detection based on TTL values
      const cacheStatus = this.detectCacheStatus(records);

      return {
        domain,
        records,
        latency,
        resolver: resolverIP,
        cacheStatus,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async lookupRecordType(domain: string, type: string): Promise<DNSRecord | null> {
    try {
      switch (type) {
        case 'A':
          const aRecords = await dns.resolve4(domain);
          return { type: 'A', value: aRecords };
        case 'AAAA':
          const aaaaRecords = await dns.resolve6(domain);
          return { type: 'AAAA', value: aaaaRecords };
        case 'MX':
          const mxRecords = await dns.resolveMx(domain);
          return { type: 'MX', value: mxRecords.map(mx => `${mx.priority} ${mx.exchange}`) };
        case 'CNAME':
          const cnameRecord = await dns.resolveCname(domain);
          return { type: 'CNAME', value: cnameRecord };
        case 'NS':
          const nsRecords = await dns.resolveNs(domain);
          return { type: 'NS', value: nsRecords };
        case 'TXT':
          const txtRecords = await dns.resolveTxt(domain);
          return { type: 'TXT', value: txtRecords.flat() };
        case 'SOA':
          const soaRecord = await dns.resolveSoa(domain);
          return { type: 'SOA', value: [
            `nsname: ${soaRecord.nsname}`,
            `hostmaster: ${soaRecord.hostmaster}`,
            `serial: ${soaRecord.serial}`,
            `refresh: ${soaRecord.refresh}`,
            `retry: ${soaRecord.retry}`,
            `expire: ${soaRecord.expire}`,
            `minttl: ${soaRecord.minttl}`
          ] };
        default:
          return null;
      }
    } catch (error) {
      // Record type might not exist, which is normal
      return null;
    }
  }

  private static detectCacheStatus(records: DNSRecord[]): 'live' | 'cached' | 'stale' {
    if (records.length === 0) return 'stale';
    
    // Simple heuristic: if any TTL is very low, consider it live
    const lowTTLRecords = records.filter(record => record.ttl && record.ttl < 300);
    return lowTTLRecords.length > 0 ? 'live' : 'cached';
  }

  static async compareResolvers(domain: string) {
    const results = await Promise.allSettled([
      this.lookupDomain(domain, 'google'),
      this.lookupDomain(domain, 'cloudflare'),
      this.lookupDomain(domain, 'quad9')
    ]);

    return results.map((result, index) => ({
      resolver: Object.keys(this.RESOLVERS)[index],
      result: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
}