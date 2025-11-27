// app/lookup/page.tsx
"use client";

import { useEffect, useState } from "react";
import { LookupForm } from "../components/lookup-form";
import { DNSResultCard } from "../components/dns-result-card";
import { DNSLatencyChart } from "../components/dns-latency-chart";
import { DNSFlowGraph } from "../components/dns-flow-graph";
import { DNSRecordGraph } from "../components/dns-record-graph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LookupResult } from "@/lib/dnsUtils";
import {
  RotateCcw,
  Zap,
  History,
  Download,
  RefreshCw,
  Timer,
  Database,
  Shield,
  Network,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LookupPage() {
  const [results, setResults] = useState<LookupResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const handleLookup = async (domain: string, resolver: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, resolver }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lookup failed");
      }

      setResults((prev) => [data, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareResolvers = async (domain: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Comparison failed");
      }

      // Add all comparison results to history
      const validResults = data.comparisons
        .filter((comp: any) => comp.result)
        .map((comp: any) => comp.result);

      setResults((prev) => [
        ...validResults,
        ...prev.slice(0, 10 - validResults.length),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results[0], null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dns-lookup-${
      results[0]?.domain
    }-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentResult = results[0];
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoRefresh && currentResult) {
      interval = setInterval(() => {
        handleLookup(currentResult.domain, currentResult.resolver);
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, refreshInterval, currentResult]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            DNS Lookup & Visualizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Perform DNS lookups and visualize the results in real-time
          </p>
        </motion.div>

        {/* Lookup Form with Enhanced Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <LookupForm
            onLookup={handleLookup}
            onCompare={handleCompareResolvers}
            isLoading={isLoading}
          />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLookup("google.com", "cloudflare")}
              disabled={isLoading}
              className="transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 mr-2" />
              Test Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLookup("github.com", "cloudflare")}
              disabled={isLoading}
              className="transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 mr-2" />
              Test GitHub
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResults([])}
              disabled={results.length === 0}
              className="transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>
        </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

        {currentResult && (
          <>
            {/* Modern Action Bar */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Network className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Current Lookup</div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                            {currentResult.domain}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(currentResult.timestamp).toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportResults}
                        className="transition-all hover:scale-105"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleLookup(currentResult.domain, currentResult.resolver)
                        }
                        className="transition-all hover:scale-105"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats at the Top */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="grid gap-4 md:grid-cols-4"
            >
                {[
                  { 
                    label: 'Latency', 
                    value: `${currentResult.latency}ms`, 
                    icon: Timer, 
                    color: 'from-blue-500 to-cyan-500',
                    bgColor: 'bg-blue-500/10',
                    iconColor: 'text-blue-500'
                  },
                  { 
                    label: 'Records', 
                    value: currentResult.records.length.toString(), 
                    icon: Database, 
                    color: 'from-green-500 to-emerald-500',
                    bgColor: 'bg-green-500/10',
                    iconColor: 'text-green-500'
                  },
                  { 
                    label: 'Cache Status', 
                    value: currentResult.cacheStatus, 
                    icon: Shield, 
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'bg-purple-500/10',
                    iconColor: 'text-purple-500'
                  },
                  { 
                    label: 'Resolver', 
                    value: currentResult.resolver.split(".")[0], 
                    icon: Network, 
                    color: 'from-orange-500 to-red-500',
                    bgColor: 'bg-orange-500/10',
                    iconColor: 'text-orange-500'
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                        <CardContent className="p-6 text-center relative z-10">
                          <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                            <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                          </div>
                          <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                            {stat.value}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">{stat.label}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </motion.div>

          <Tabs defaultValue="results" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="graph">Record Graph</TabsTrigger>
              <TabsTrigger value="history">
                History ({results.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <DNSResultCard {...currentResult} />
            </TabsContent>

            <TabsContent value="visualization">
              <div className="grid gap-6 md:grid-cols-2">
                <DNSLatencyChart results={results} />
                <DNSFlowGraph result={currentResult} />
              </div>
            </TabsContent>

            <TabsContent value="graph">
              <DNSRecordGraph result={currentResult} />
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-2 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-500" />
                    Lookup History ({results.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.map((result, index) => {
                      const statusColors = {
                        live: 'bg-green-500',
                        cached: 'bg-yellow-500',
                        stale: 'bg-red-500'
                      };
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm ${
                            index === 0 ? "ring-2 ring-blue-500 border-blue-500/50" : ""
                          }`}
                          onClick={() => {
                            const newResults = [
                              result,
                              ...results.filter((_, i) => i !== index),
                            ];
                            setResults(newResults);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-3 h-3 rounded-full shadow-lg animate-pulse ${
                                statusColors[result.cacheStatus as keyof typeof statusColors] || 'bg-gray-500'
                              }`}
                            />
                            <div>
                              <div className="font-semibold text-base">{result.domain}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Timer className="w-3 h-3" />
                                {new Date(result.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono text-sm">
                              {result.latency}ms
                            </Badge>
                            <Badge 
                              variant={
                                result.cacheStatus === 'live' ? 'default' : 
                                result.cacheStatus === 'cached' ? 'secondary' : 'destructive'
                              }
                              className="capitalize"
                            >
                              {result.cacheStatus}
                            </Badge>
                            <span className="text-xs text-muted-foreground hidden md:inline">
                              {result.resolver}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

        {/* Modern Empty State */}
        {!currentResult && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 text-center py-16 hover:shadow-xl transition-all duration-300">
              <CardContent>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  No Lookups Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Perform a DNS lookup to see results and analytics
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button 
                    onClick={() => handleLookup("example.com", "cloudflare")}
                    className="transition-all hover:scale-105"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Try Example
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleLookup("google.com", "cloudflare")}
                    className="transition-all hover:scale-105"
                  >
                    Test Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
