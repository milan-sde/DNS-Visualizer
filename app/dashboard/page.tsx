// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Clock, Zap, Globe, Shield, RefreshCw, 
  Activity, Server, Network, BarChart3, AlertCircle, 
  ArrowUpRight, Database, Gauge, Timer
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalLookups: number;
  averageLatency: number;
  cacheHitRate: number;
  topDomains: { domain: string; count: number; latency: number }[];
  cacheDistribution: { name: string; value: number; color: string }[];
  latencyTrend: { time: string; latency: number }[];
  resolverStats: { resolver: string; requests: number; avgLatency: number }[];
  recentLookups: { domain: string; latency: number; status: string; timestamp: string }[];
  recordTypeStats: { type: string; count: number; color: string }[];
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load analytics</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={loadAnalytics}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>No analytics data available</p>
          <Button onClick={loadAnalytics} className="mt-4">Load Data</Button>
        </div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        {/* Modern Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-rrom-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
              DNS Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Real-time insights and performance metrics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <Button 
                key={range}
                variant={timeRange === range ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeRange(range)}
                className="transition-all hover:scale-105"
              >
                {range.toUpperCase()}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadAnalytics}
              disabled={isLoading}
              className="transition-all hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Modern Stats Cards with Gradients */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Lookups</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-1">{analytics.totalLookups.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>Last {timeRange}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden border-2 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-1">{analytics.averageLatency}ms</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="w-3 h-3 text-blue-500" />
                  <span>Average response time</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-2 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cache Hit Rate</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-1">{analytics.cacheHitRate}%</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Gauge className="w-3 h-3 text-green-500" />
                  <span>Cached responses</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Resolvers</CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Server className="w-5 h-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-1">{analytics.resolverStats.length}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Network className="w-3 h-3 text-orange-500" />
                  <span>DNS resolvers used</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Modern Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle>Latency Trend</CardTitle>
                      <CardDescription className="text-xs">Response time over time</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.latencyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis 
                      dataKey="time" 
                      stroke="currentColor"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="currentColor"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="latency" 
                      stroke="#8884d8" 
                      fillOpacity={1}
                      fill="url(#colorLatency)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Shield className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle>Cache Distribution</CardTitle>
                      <CardDescription className="text-xs">Response cache status breakdown</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.cacheDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    >
                      {analytics.cacheDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Globe className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>Top Domains</CardTitle>
                    <CardDescription className="text-xs">Most queried domains</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topDomains} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis type="number" stroke="currentColor" style={{ fontSize: '12px' }} />
                    <YAxis 
                      type="category" 
                      dataKey="domain" 
                      width={100}
                      stroke="currentColor"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="url(#colorBar)" 
                      radius={[0, 8, 8, 0]}
                    >
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8884d8" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#82ca9d" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Network className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle>Resolver Performance</CardTitle>
                    <CardDescription className="text-xs">Performance by resolver</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.resolverStats.map((stat, index) => {
                    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
                    const maxLatency = Math.max(...analytics.resolverStats.map(s => s.avgLatency));
                    const percentage = (stat.avgLatency / maxLatency) * 100;
                    
                    return (
                      <motion.div
                        key={stat.resolver}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="group"
                      >
                        <div className="p-4 border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full shadow-lg" 
                                style={{ backgroundColor: colors[index] || '#999' }}
                              />
                              <span className="font-semibold">{stat.resolver}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{stat.avgLatency}ms</div>
                              <div className="text-xs text-muted-foreground">{stat.requests} requests</div>
                            </div>
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: colors[index] || '#999' }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Record Type Stats */}
        {analytics.recordTypeStats.length > 0 && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-pink-500/10">
                    <Database className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <CardTitle>Record Type Distribution</CardTitle>
                    <CardDescription className="text-xs">DNS record types breakdown</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {analytics.recordTypeStats.map((stat, index) => (
                    <motion.div
                      key={stat.type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                      className="text-center p-4 border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm"
                    >
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: stat.color }}
                      >
                        {stat.type}
                      </div>
                      <div className="text-2xl font-bold">{stat.count}</div>
                      <div className="text-xs text-muted-foreground">records</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity - Modern Design */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1 }}
        >
          <Card className="border-2 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Clock className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <CardTitle>Recent Lookups</CardTitle>
                    <CardDescription className="text-xs">Latest DNS query activity</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.recentLookups.map((lookup, index) => {
                  const statusColors = {
                    live: 'bg-green-500',
                    cached: 'bg-blue-500',
                    stale: 'bg-red-500'
                  };
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.05 }}
                      className="group flex items-center justify-between p-4 border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${statusColors[lookup.status as keyof typeof statusColors] || 'bg-gray-500'} shadow-lg animate-pulse`} />
                        <div>
                          <div className="font-semibold text-base">{lookup.domain}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {lookup.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary" 
                          className="font-mono text-sm px-3 py-1"
                        >
                          {lookup.latency}ms
                        </Badge>
                        <Badge 
                          variant={
                            lookup.status === 'live' ? 'default' : 
                            lookup.status === 'cached' ? 'secondary' : 'destructive'
                          }
                          className="capitalize"
                        >
                          {lookup.status}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}