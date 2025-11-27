'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LookupResult } from '@/lib/dnsUtils';
import { Network, Server, Globe, Mail, FileText, ArrowDown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface DNSRecordGraphProps {
  result: LookupResult;
}

export function DNSRecordGraph({ result }: DNSRecordGraphProps) {
  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return <Globe className="w-5 h-5" />;
      case 'MX':
        return <Mail className="w-5 h-5" />;
      case 'NS':
        return <Server className="w-5 h-5" />;
      case 'SOA':
        return <FileText className="w-5 h-5" />;
      default:
        return <Network className="w-5 h-5" />;
    }
  };

  const getRecordColor = (type: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string; gradient: string } } = {
      'A': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', gradient: 'from-blue-500 to-cyan-500' },
      'AAAA': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30', gradient: 'from-green-500 to-emerald-500' },
      'MX': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
      'CNAME': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30', gradient: 'from-orange-500 to-red-500' },
      'NS': { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30', gradient: 'from-red-500 to-rose-500' },
      'TXT': { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30', gradient: 'from-indigo-500 to-blue-500' },
      'SOA': { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30', gradient: 'from-pink-500 to-rose-500' }
    };
    return colors[type] || { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30', gradient: 'from-gray-500 to-gray-600' };
  };

  return (
    <Card className="border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <Network className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-2xl">Record Relationship Graph</CardTitle>
            <CardDescription>Visual representation of DNS record hierarchy</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Domain Node - Enhanced */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl shadow-xl font-bold text-xl flex items-center gap-3">
                <Globe className="w-6 h-6" />
                {result.domain}
              </div>
            </div>
          </motion.div>

          {/* Animated Connection Line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-1 h-12 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent" />
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <ArrowDown className="w-4 h-4 text-purple-500" />
              </motion.div>
            </div>
          </motion.div>

          {/* Records Grid - Enhanced */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {result.records.map((record, index) => {
              const colors = getRecordColor(record.type);
              const values = Array.isArray(record.value) ? record.value : [record.value];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`relative overflow-hidden border-2 ${colors.border} rounded-xl p-5 hover:shadow-xl transition-all duration-300 ${colors.bg} group`}
                >
                  {/* Gradient Background Effect */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border-2`}>
                        {getRecordIcon(record.type)}
                      </div>
                      <div>
                        <Badge variant="outline" className={`${colors.text} ${colors.border} border font-bold text-base px-3 py-1`}>
                          {record.type}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {values.length} record{values.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Values */}
                  <div className="space-y-2 relative z-10">
                    {values.slice(0, 2).map((value, i) => (
                      <div
                        key={i}
                        className="p-3 bg-background/60 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                      >
                        <code className="text-sm font-mono break-all text-foreground block">
                          {value}
                        </code>
                      </div>
                    ))}
                    {values.length > 2 && (
                      <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border/30">
                        <Zap className="w-3 h-3 inline mr-1" />
                        +{values.length - 2} more {record.type} record{values.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Enhanced Legend */}
          {result.records.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="border-t pt-6 mt-8"
            >
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Network className="w-4 h-4" />
                Record Type Legend
              </h4>
              <div className="flex flex-wrap gap-4">
                {Array.from(new Set(result.records.map(r => r.type))).map((type) => {
                  const colors = getRecordColor(type);
                  return (
                    <div key={type} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                      <span className="text-sm font-medium">{type}</span>
                      <Badge variant="secondary" className="text-xs">
                        {result.records.filter(r => r.type === type).length}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}