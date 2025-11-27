'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, BarChart3, History, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      href: '/lookup',
      icon: Search,
      title: 'DNS Lookup',
      description: 'Perform comprehensive DNS lookups with multiple resolver support',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      delay: 0.1
    },
    {
      href: '/dashboard',
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'View detailed analytics and performance metrics with real-time insights',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      delay: 0.2
    },
    {
      href: '/dashboard',
      icon: History,
      title: 'History & Trends',
      description: 'Access historical lookup data and track performance trends over time',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      delay: 0.3
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            DNS Lookup & Visualizer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
          >
            A modern tool for DNS lookups, visualization, and analytics with real-time insights
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/lookup">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/dashboard">
                View Dashboard
                <BarChart3 className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={`${feature.href}-${feature.title}-${index}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: feature.delay }}
              >
                <Link href={feature.href}>
                  <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 h-full group cursor-pointer">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
                    <CardHeader className="relative z-10">
                      <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                      </div>
                      <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <Button variant="ghost" className="w-full group-hover:text-primary transition-colors">
                        Explore
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for comprehensive DNS analysis
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: 'Fast Lookups', desc: 'Lightning-fast DNS resolution' },
              { icon: Shield, title: 'Multiple Resolvers', desc: 'Compare Google, Cloudflare, Quad9' },
              { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Live performance metrics' },
              { icon: BarChart3, title: 'Visual Insights', desc: 'Beautiful charts and graphs' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-center p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}