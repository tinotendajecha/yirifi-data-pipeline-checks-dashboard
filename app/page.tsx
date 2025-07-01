'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, FileText, Search, Globe, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const features = [
    {
      icon: Database,
      title: 'Real-time Monitoring',
      description: 'Monitor your data pipeline in real-time with instant updates and alerts for stuck documents.',
      color: 'from-purple-500 to-blue-500',
    },
    {
      icon: FileText,
      title: 'Article Classification',
      description: 'Track documents stuck in the article classification process with detailed insights.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Search,
      title: 'Channel Analysis',
      description: 'Monitor source channel analysis bottlenecks and optimize your data flow.',
      color: 'from-cyan-500 to-teal-500',
    },
    {
      icon: Globe,
      title: 'Website Scraping',
      description: 'Keep track of URLs stuck in the scraping process and maintain data collection efficiency.',
      color: 'from-teal-500 to-green-500',
    },
  ];

  const stats = [
    { label: 'Pipeline Stages', value: '4', icon: BarChart3 },
    { label: 'Real-time Updates', value: '24/7', icon: Zap },
    { label: 'Data Security', value: '100%', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3000A5] to-[#00CFFF] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFD700] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF00AA] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-[#3000A5]" />
              </div>
              <span className="text-2xl font-bold text-white">DataFlow Monitor</span>
            </div>
            <Link href="/dashboard">
              <Button className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#3000A5] font-semibold px-6 py-2 transition-all duration-200 hover:scale-105">
                Access Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Data Pipeline
              <span className="block bg-gradient-to-r from-[#FFD700] to-[#FF00AA] bg-clip-text text-transparent">
                Check Dashboard
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Monitor stuck documents across your data processing pipeline with real-time insights and comprehensive analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-[#FF00AA] hover:bg-[#FF00AA]/90 text-white font-semibold px-8 py-4 text-lg transition-all duration-200 hover:scale-105 shadow-2xl"
                >
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold px-8 py-4 text-lg transition-all duration-200 hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}