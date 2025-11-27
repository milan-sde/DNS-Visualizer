'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DNSRecord } from '@/lib/dnsUtils';
import { Globe, Mail, Server, FileText, Network, Copy, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface DNSResultCardProps {
  domain: string;
  records: DNSRecord[];
  latency: number;
  resolver: string;
  cacheStatus: 'live' | 'cached' | 'stale';
}

export function DNSResultCard({ domain, records, latency, resolver, cacheStatus }: DNSResultCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return <Globe className="w-4 h-4" />;
      case 'MX':
        return <Mail className="w-4 h-4" />;
      case 'NS':
        return <Server className="w-4 h-4" />;
      case 'SOA':
        return <FileText className="w-4 h-4" />;
      case 'CNAME':
        return <Network className="w-4 h-4" />;
      default:
        return <Network className="w-4 h-4" />;
    }
  };

  const getRecordColor = (type: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string } } = {
      'A': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
      'AAAA': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
      'MX': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
      'CNAME': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
      'NS': { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
      'TXT': { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
      'SOA': { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' }
    };
    return colors[type] || { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' };
  };

  const getCacheStatusColor = (status: string) => {
    switch (status) {
      case 'live': return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
      case 'cached': return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' };
      case 'stale': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' };
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const cacheStatusStyle = getCacheStatusColor(cacheStatus);

  return (
    <Card className="w-full border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-2xl mb-2">DNS Records</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-foreground">{domain}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Badge variant="secondary" className="font-mono">{latency}ms</Badge>
            <Badge variant="secondary">{resolver}</Badge>
            <Badge className={`${cacheStatusStyle.bg} ${cacheStatusStyle.text} ${cacheStatusStyle.border} border`}>
              {cacheStatus.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No DNS records found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {records.map((record, index) => {
              const colors = getRecordColor(record.type);
              const values = Array.isArray(record.value) ? record.value : [record.value];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-2 ${colors.border} rounded-lg p-4 hover:shadow-lg transition-all duration-300 ${colors.bg} relative overflow-hidden group`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} opacity-20 rounded-bl-full`} />
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                        {getRecordIcon(record.type)}
                      </div>
                      <div>
                        <Badge variant="outline" className={`${colors.text} ${colors.border} border font-bold text-sm`}>
                          {record.type}
                        </Badge>
                        {record.ttl && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            TTL: {record.ttl}s
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 relative z-10">
                    {values.slice(0, 3).map((value, i) => (
                      <div
                        key={i}
                        className="group/value flex items-center gap-2 p-2 bg-background/50 rounded border border-border/50 hover:border-primary/50 transition-colors"
                      >
                        <code className="flex-1 font-mono text-sm break-all text-foreground">
                          {value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(value, index * 100 + i)}
                          className="opacity-0 group-hover/value:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index * 100 + i ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    ))}
                    {values.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                        +{values.length - 3} more {record.type} record{values.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}