'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ArrowLeft, Search, ExternalLink, Download, FileDown } from 'lucide-react';
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

export default function StuckInSourceChannelAnalysis() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checks/stuck-in-source-channel-analysis');
      if (response.ok) {
        const result = await response.json();

        console.log(result)
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching source channel analysis data:', error);
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

    const filename = generateFilename('stuck-source-channel-analysis', dataToDownload.total);
    downloadCSV(csvData, filename);
  };

  const handleSingleDownload = (item: StuckDataItem) => {
    const csvData = {
      link_yid: item.link_yid,
      url: item.url,
      country_code: item.source_channel?.country_code || 'N/A',
      createdAt: item.createdAt
    };
    downloadSingleRow(csvData, 'stuck-source-channel-analysis');
  };

  const displayData = filteredData || data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3000A5] to-[#00CFFF]">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            {/* Header row with back button and title */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 w-full sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="w-full sm:w-auto">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="leading-tight">Source Channel Analysis</span>
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base">Items stuck in channel analysis process</p>
                  {lastUpdated && (
                    <p className="text-blue-200 text-xs sm:text-sm mt-1">
                      Last updated: {lastUpdated.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Controls row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
              <div className="w-full sm:w-auto">
                <CountryFilter
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                />
              </div>
              <Button
                onClick={fetchData}
                disabled={loading}
                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#3000A5] font-semibold px-4 sm:px-6 py-2 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-t-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap">
                  <span>Stuck Analysis Items Overview</span>
                  {selectedCountry && (
                    <Flag code={selectedCountry} height={12} width={18}/>
                  )}
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {displayData && displayData.results && displayData.results.length > 0 && (
                    <Button
                      onClick={handleBulkDownload}
                      className="bg-[#00E0FF] hover:bg-[#00E0FF]/90 text-white font-semibold px-3 sm:px-4 py-2 transition-all duration-200 hover:scale-105 text-sm"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  )}
                  <Badge className={`${getStatusColor(displayData?.total ?? 0)} border-0 px-3 sm:px-4 py-2 text-base sm:text-lg font-bold text-center`}>
                    {loading ? '...' : displayData?.total ?? 0} Total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              ) : !displayData || displayData.total === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Search className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-2">All Clear!</h3>
                  <p className="text-gray-600 text-sm sm:text-base px-4">
                    {selectedCountry
                      ? `No items are currently stuck in source channel analysis for ${formatCountryDisplay(selectedCountry)}.`
                      : 'No items are currently stuck in source channel analysis.'
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-400">
                    <h3 className="font-semibold text-orange-800 mb-1 text-sm sm:text-base">
                      ⚠️ {displayData.total} items require attention
                      {selectedCountry && ` in ${formatCountryDisplay(selectedCountry)}`}
                    </h3>
                    <p className="text-orange-700 text-xs sm:text-sm">
                      These items have been stuck in the source channel analysis stage and may need manual review.
                    </p>
                  </div>

                  {/* Mobile-first table wrapper with horizontal scroll */}
                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                              Link YID
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm min-w-[200px] px-2 sm:px-4">
                              URL
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                              Country
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                              Created At
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayData.results.map((item, index) => (
                            <TableRow
                              key={index}
                              className="hover:bg-[#00E0FF]/5 transition-colors duration-200"
                            >
                              <TableCell className="font-mono text-xs sm:text-sm text-gray-700 px-2 sm:px-4">
                                <div className="max-w-[80px] sm:max-w-none truncate" title={item.link_yid}>
                                  {item.link_yid}
                                </div>
                              </TableCell>
                              <TableCell className="px-2 sm:px-4">
                                <div 
                                  className="max-w-[150px] sm:max-w-xs truncate text-xs sm:text-sm text-gray-600" 
                                  title={item.url}
                                >
                                  {item.url}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm px-2 sm:px-4">
                                {item.source_channel?.country_code ? (
                                  <div className='flex gap-1 items-center justify-center'>
                                    <span className="hidden sm:inline">{item.source_channel.country_code}</span>
                                    <Flag code={item.source_channel.country_code} height={12} width={18} />
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">N/A</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm text-gray-500 px-2 sm:px-4 whitespace-nowrap">
                                <div className="max-w-[100px] sm:max-w-none truncate">
                                  {formatDate(item.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="px-2 sm:px-4">
                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] transition-all duration-200 px-2 py-1 h-auto"
                                    onClick={() => window.open(item.url, '_blank')}
                                  >
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    <span className="hidden sm:inline">Open</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] transition-all duration-200 px-2 py-1 h-auto"
                                    onClick={() => handleSingleDownload(item)}
                                  >
                                    <FileDown className="mr-1 h-3 w-3" />
                                    <span className="hidden sm:inline">CSV</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {displayData.results.length >= 100 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center text-xs sm:text-sm text-blue-700">
                      Showing first 100 results. There may be more stuck items.
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