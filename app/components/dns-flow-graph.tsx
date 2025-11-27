'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LookupResult } from '@/lib/dnsUtils';
import { ArrowRight, CheckCircle2, Clock, XCircle, Zap, Network } from 'lucide-react';
import { motion } from 'framer-motion';

interface DNSFlowGraphProps {
  result: LookupResult;
}

export function DNSFlowGraph({ result }: DNSFlowGraphProps) {
  const steps = [
    { 
      name: 'Client Request', 
      status: 'completed',
      icon: Network,
      description: 'DNS query initiated'
    },
    { 
      name: 'Resolver', 
      status: 'completed',
      icon: Zap,
      description: result.resolver
    },
    { 
      name: 'Root Server', 
      status: result.cacheStatus === 'live' ? 'completed' : 'cached',
      icon: Network,
      description: result.cacheStatus === 'live' ? 'Queried' : 'Cached'
    },
    { 
      name: 'TLD Server', 
      status: result.cacheStatus === 'live' ? 'completed' : 'cached',
      icon: Network,
      description: result.cacheStatus === 'live' ? 'Queried' : 'Cached'
    },
    { 
      name: 'Authoritative', 
      status: 'completed',
      icon: CheckCircle2,
      description: 'DNS records retrieved'
    },
    { 
      name: 'Response', 
      status: result.records.length > 0 ? 'completed' : 'failed',
      icon: result.records.length > 0 ? CheckCircle2 : XCircle,
      description: `${result.records.length} record${result.records.length !== 1 ? 's' : ''} returned`
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': 
        return { 
          color: 'bg-green-500', 
          text: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          icon: CheckCircle2
        };
      case 'cached': 
        return { 
          color: 'bg-yellow-500', 
          text: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          icon: Clock
        };
      case 'failed': 
        return { 
          color: 'bg-red-500', 
          text: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          icon: XCircle
        };
      default: 
        return { 
          color: 'bg-gray-500', 
          text: 'text-gray-500',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          icon: Clock
        };
    }
  };

  return (
    <Card className="border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10">
            <Network className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <CardTitle className="text-xl">DNS Resolution Flow</CardTitle>
            <CardDescription>Step-by-step DNS resolution process</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const config = getStatusConfig(step.status);
            const Icon = step.icon;
            const StatusIcon = config.icon;
            
            return (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                {/* Step Card */}
                <div className={`flex-1 border-2 ${config.border} rounded-lg p-4 ${config.bg} hover:shadow-md transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                      <Icon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{step.name}</span>
                        <StatusIcon className={`w-4 h-4 ${config.text}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${config.text} ${config.border} border capitalize`}
                    >
                      {step.status}
                    </Badge>
                  </div>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-sm font-semibold mb-1">Resolution Path</div>
              <div className="text-xs text-muted-foreground font-mono">
                Client → {result.resolver} → {
                  result.cacheStatus === 'live' 
                    ? 'Root → TLD → Authoritative' 
                    : 'Cached Response'
                } → {result.domain}
              </div>
            </div>
            <Badge variant="secondary" className="font-mono">
              {result.latency}ms
            </Badge>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}