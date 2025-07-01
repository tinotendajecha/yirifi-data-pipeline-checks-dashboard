'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ArrowLeft, FileText, ExternalLink, Download, FileDown } from 'lucide-react';
import Link from 'next/link';
import { downloadCSV, downloadSingleRow, generateFilename, type CSVData } from '@/lib/csv-utils';
import { CountryFilter } from '@/components/ui/country-filter';
import { formatCountryDisplay } from '@/lib/country-utils';
import Flag from 'react-world-flags';

interface StuckDataItem {
  link_yid: string;
  url: string;
  source_channel?: {
    country_code?: string;
  };
  createdAt: string;
}

interface ApiResponse {
  total: number;
  results: StuckDataItem[];
}

export default function StuckInArticleClassifier() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checks/stuck-in-article-classifier');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching article classifier data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on selected country
  const filteredData = useMemo(() => {
    if (!data || !selectedCountry) return data;

    const filteredResults = data.results.filter(item =>
      item.source_channel?.country_code === selectedCountry
    );

    return {
      total: filteredResults.length,
      results: filteredResults
    };
  }, [data, selectedCountry]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (total: number) => {
    if (total === 0) return 'bg-green-100 text-green-800';
    if (total < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleBulkDownload = () => {
    const dataToDownload = filteredData || data;
    if (!dataToDownload || !dataToDownload.results || dataToDownload.results.length === 0) {
      alert('No data available to download');
      return;
    }

    // Transform data for CSV
    const csvData = dataToDownload.results.map(item => ({
      link_yid: item.link_yid,
      url: item.url,
      country_code: item.source_channel?.country_code || 'N/A',
      createdAt: item.createdAt
    }));

    const filename = generateFilename('stuck-article-classifier', dataToDownload.total);
    downloadCSV(csvData, filename);
  };

  const handleSingleDownload = (item: StuckDataItem) => {
    const csvData = {
      link_yid: item.link_yid,
      url: item.url,
      country_code: item.source_channel?.country_code || 'N/A',
      createdAt: item.createdAt
    };
    downloadSingleRow(csvData, 'stuck-article-classifier');
  };

  const displayData = filteredData || data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3000A5] to-[#00CFFF]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <FileText className="h-8 w-8" />
                  Article Classifier
                </h1>
                <p className="text-blue-100">Documents stuck in article classification process</p>
                {lastUpdated && (
                  <p className="text-blue-200 text-sm mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CountryFilter
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
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
        </div>

        <div className="grid gap-6">
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  Stuck Documents Overview
                  {selectedCountry && (
                    <Badge className="ml-3 bg-[#00E0FF] text-white">
                      {formatCountryDisplay(selectedCountry)}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-3">
                  {displayData && displayData.results && displayData.results.length > 0 && (
                    <Button
                      onClick={handleBulkDownload}
                      className="bg-[#00E0FF] hover:bg-[#00E0FF]/90 text-white font-semibold px-4 py-2 transition-all duration-200 hover:scale-105"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  )}
                  <Badge className={`${getStatusColor(displayData?.total ?? 0)} border-0 px-4 py-2 text-lg font-bold`}>
                    {loading ? '...' : displayData?.total ?? 0} Total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              ) : !displayData || displayData.total === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-green-600 mb-2">All Clear!</h3>
                  <p className="text-gray-600">
                    {selectedCountry
                      ? `No documents are currently stuck in article classification for ${formatCountryDisplay(selectedCountry)}.`
                      : 'No documents are currently stuck in article classification.'
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-400">
                    <h3 className="font-semibold text-orange-800 mb-1">
                      ⚠️ {displayData.total} documents require attention
                      {selectedCountry && ` in ${formatCountryDisplay(selectedCountry)}`}
                    </h3>
                    <p className="text-orange-700 text-sm">
                      These documents have been stuck in the article classification stage and may need manual review.
                    </p>
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">Link YID</TableHead>
                          <TableHead className="font-semibold text-gray-700">URL</TableHead>
                          <TableHead className="font-semibold text-gray-700">Country</TableHead>
                          <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayData.results.map((item, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-[#00E0FF]/5 transition-colors duration-200"
                          >
                            <TableCell className="font-mono text-sm text-gray-700">
                              {item.link_yid}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate text-sm text-gray-600" title={item.url}>
                                {item.url}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.source_channel?.country_code ? (
                                <div className='flex gap-1 items-center justify-center'>
                                  <span>{item.source_channel.country_code}</span>
                                  <Flag code={item.source_channel.country_code} height={12} width={18} />
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(item.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] transition-all duration-200"
                                  onClick={() => window.open(item.url, '_blank')}
                                >
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                  Open
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] transition-all duration-200"
                                  onClick={() => handleSingleDownload(item)}
                                >
                                  <FileDown className="mr-1 h-3 w-3" />
                                  CSV
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {displayData.results.length >= 100 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center text-sm text-blue-700">
                      Showing first 100 results. There may be more stuck documents.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}