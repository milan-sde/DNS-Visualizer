// app/components/lookup-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Loader2, GitCompare, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LookupFormProps {
  onLookup: (domain: string, resolver: string) => void;
  onCompare?: (domain: string) => void;
  isLoading: boolean;
}

export function LookupForm({ onLookup, onCompare, isLoading }: LookupFormProps) {
  const [domain, setDomain] = useState('');
  const [resolver, setResolver] = useState('cloudflare');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onLookup(domain.trim(), resolver);
    }
  };

  const handleCompare = () => {
    if (domain.trim() && onCompare) {
      onCompare(domain.trim());
    }
  };

  const quickDomains = ['google.com', 'github.com', 'vercel.com', 'cloudflare.com'];

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Search className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-2xl">DNS Lookup</CardTitle>
            <CardDescription className="text-sm mt-1">
              Enter a domain to perform a comprehensive DNS lookup
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !domain.trim()}
              className="transition-all hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Lookup
            </Button>
          </div>
          
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">Resolver:</label>
              <select 
                value={resolver}
                onChange={(e) => setResolver(e.target.value)}
                className="border-2 rounded-lg px-3 py-2 text-sm bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              >
                <option value="cloudflare">Cloudflare (1.1.1.1)</option>
                <option value="google">Google (8.8.8.8)</option>
                <option value="quad9">Quad9 (9.9.9.9)</option>
              </select>
            </div>

            {onCompare && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCompare}
                disabled={isLoading || !domain.trim()}
                className="transition-all hover:scale-105"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare All
              </Button>
            )}
          </div>
        </form>

        {/* Quick Domain Buttons */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Quick test:</p>
          <div className="flex flex-wrap gap-2">
            {quickDomains.map((quickDomain) => (
              <Button
                key={quickDomain}
                variant="outline"
                size="sm"
                onClick={() => {
                  setDomain(quickDomain);
                  onLookup(quickDomain, resolver);
                }}
                disabled={isLoading}
                className="transition-all hover:scale-105 hover:border-primary/50"
              >
                <Zap className="w-3 h-3 mr-1" />
                {quickDomain}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}