'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, Database, FileText, Search, Globe } from 'lucide-react';
import Link from 'next/link';

interface StuckDataItem {
  link_yid: string;
  url: string;
  createdAt: string;
}

interface ApiResponse {
  total: number;
  results: StuckDataItem[];
}

interface DashboardData {
  articleClassifier: ApiResponse | null;
  generalFileParser: ApiResponse | null;
  sourceChannelAnalysis: ApiResponse | null;
  websiteScraping: ApiResponse | null;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    articleClassifier: null,
    generalFileParser: null,
    sourceChannelAnalysis: null,
    websiteScraping: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        articleClassifierRes,
        generalFileParserRes,
        sourceChannelAnalysisRes,
        websiteScrapingRes,
      ] = await Promise.all([
        fetch('/api/checks/stuck-in-article-classifier'),
        fetch('/api/checks/stuck-in-general-file-parser'),
        fetch('/api/checks/stuck-in-source-channel-analysis'),
        fetch('/api/checks/stuck-in-website-scraping'),
      ]);

      const [
        articleClassifier,
        generalFileParser,
        sourceChannelAnalysis,
        websiteScraping,
      ] = await Promise.all([
        articleClassifierRes.ok ? articleClassifierRes.json() : null,
        generalFileParserRes.ok ? generalFileParserRes.json() : null,
        sourceChannelAnalysisRes.ok ? sourceChannelAnalysisRes.json() : null,
        websiteScrapingRes.ok ? websiteScrapingRes.json() : null,
      ]);

      console.log('Fetched dashboard data:', articleClassifier, generalFileParser, sourceChannelAnalysis, websiteScraping);

      setData({
        articleClassifier,
        generalFileParser,
        sourceChannelAnalysis,
        websiteScraping,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetchingg dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (total: number) => {
    if (total === 0) return 'bg-green-100 text-green-800';
    if (total < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const cards = [
    {
      title: 'Article Classifier',
      description: 'Documents stuck in article classification',
      icon: FileText,
      data: data.articleClassifier,
      href: '/dashboard/stuck-in-article-classifier',
      color: 'from-purple-500 to-blue-500',
    },
    {
      title: 'General File Parser',
      description: 'Files stuck in parsing process',
      icon: Database,
      data: data.generalFileParser,
      href: '/dashboard/stuck-in-general-file-parser',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Source Channel Analysis',
      description: 'Items stuck in channel analysis',
      icon: Search,
      data: data.sourceChannelAnalysis,
      href: '/dashboard/stuck-in-source-channel-analysis',
      color: 'from-cyan-500 to-teal-500',
    },
    {
      title: 'Website Scraping',
      description: 'URLs stuck in scraping process',
      icon: Globe,
      data: data.websiteScraping,
      href: '/dashboard/stuck-in-website-scraping',
      color: 'from-teal-500 to-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3000A5] to-[#00CFFF]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Data Pipeline Check Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                Monitor stuck documents across your data processing pipeline
              </p>
              {lastUpdated && (
                <p className="text-blue-200 text-sm mt-2">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
            <Button
              onClick={fetchData}
              disabled={loading}
              className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#3000A5] font-semibold px-6 py-2 transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const total = card.data?.total ?? 0;
            const results = card.data?.results ?? [];
            
            return (
              <Card key={index} className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className={`pb-3 bg-gradient-to-r ${card.color} text-white rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-sm">
                        {card.description}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(total)} border-0 px-3 py-1 text-sm font-bold`}>
                      {loading ? '...' : total}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : total === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-green-600 font-semibold mb-2">✓ All Clear</div>
                      <p className="text-sm text-gray-500">No stuck documents</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Recent Issues</span>
                      </div>
                      {results.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="border-l-2 border-[#00E0FF] pl-3 py-1">
                          <div className="text-xs font-mono text-gray-600 truncate">
                            {item.link_yid}
                          </div>
                          <div className="text-xs text-gray-500 truncate" title={item.url}>
                            {item.url}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                      ))}
                      {results.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{results.length - 3} more items
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t">
                    <Link href={card.href}>
                      <Button 
                        className="w-full bg-[#FF00AA] hover:bg-[#FF00AA]/90 text-white transition-all duration-200 hover:scale-105"
                        size="sm"
                      >
                        View All Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#3000A5] flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-2xl font-bold text-[#3000A5]">
                  {loading ? '...' : (data.articleClassifier?.total ?? 0) + (data.generalFileParser?.total ?? 0) + (data.sourceChannelAnalysis?.total ?? 0) + (data.websiteScraping?.total ?? 0)}
                </div>
                <div className="text-sm text-gray-600">Total Stuck</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : cards.filter(card => (card.data?.total ?? 0) === 0).length}
                </div>
                <div className="text-sm text-gray-600">Healthy Stages</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : cards.filter(card => (card.data?.total ?? 0) > 0 && (card.data?.total ?? 0) < 10).length}
                </div>
                <div className="text-sm text-gray-600">Warning</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-pink-50">
                <div className="text-2xl font-bold text-red-600">
                  {loading ? '...' : cards.filter(card => (card.data?.total ?? 0) >= 10).length}
                </div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}