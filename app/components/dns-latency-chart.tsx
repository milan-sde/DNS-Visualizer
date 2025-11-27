'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LookupResult } from '@/lib/dnsUtils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface DNSLatencyChartProps {
  results: LookupResult[];
}

export function DNSLatencyChart({ results }: DNSLatencyChartProps) {
  const chartData = results.map((result, index) => {
    const timestamp = typeof result.timestamp === 'string' 
      ? new Date(result.timestamp) 
      : result.timestamp;
    
    return {
      name: `#${results.length - index}`,
      latency: result.latency,
      records: result.records.length,
      timestamp: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fullTime: timestamp.toLocaleString(),
    };
  }).reverse();

  const avgLatency = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, d) => sum + d.latency, 0) / chartData.length)
    : 0;
  
  const minLatency = chartData.length > 0 ? Math.min(...chartData.map(d => d.latency)) : 0;
  const maxLatency = chartData.length > 0 ? Math.max(...chartData.map(d => d.latency)) : 0;
  const trend = chartData.length > 1 
    ? (chartData[chartData.length - 1].latency - chartData[0].latency)
    : 0;

  return (
    <Card className="border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Latency Over Time</CardTitle>
              <CardDescription>Response time tracking across lookups</CardDescription>
            </div>
          </div>
          {chartData.length > 0 && (
            <div className="flex items-center gap-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : null}
              <span className="text-sm font-medium">
                Avg: {avgLatency}ms
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No latency data available</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-xs text-muted-foreground mb-1">Min</div>
                <div className="text-lg font-bold text-blue-500">{minLatency}ms</div>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-xs text-muted-foreground mb-1">Average</div>
                <div className="text-lg font-bold text-purple-500">{avgLatency}ms</div>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-xs text-muted-foreground mb-1">Max</div>
                <div className="text-lg font-bold text-orange-500">{maxLatency}ms</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="currentColor"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="currentColor"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}ms`, 'Latency']}
                  labelFormatter={(label) => `Lookup ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#8884d8" 
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}