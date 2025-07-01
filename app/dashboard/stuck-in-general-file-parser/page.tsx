'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ArrowLeft, Database, ExternalLink, Download, FileDown } from 'lucide-react';
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

export default function StuckInGeneralFileParser() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checks/stuck-in-general-file-parser');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching general file parser data:', error);
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

  const formatDateMobile = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

    const filename = generateFilename('stuck-general-file-parser', dataToDownload.total);
    downloadCSV(csvData, filename);
  };

  const handleSingleDownload = (item: StuckDataItem) => {
    const csvData = {
      link_yid: item.link_yid,
      url: item.url,
      country_code: item.source_channel?.country_code || 'N/A',
      createdAt: item.createdAt
    };
    downloadSingleRow(csvData, 'stuck-general-file-parser');
  };

  const displayData = filteredData || data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3000A5] to-[#00CFFF]">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            {/* Top Row - Back Button and Title */}
            <div className="flex items-start gap-3 sm:gap-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 shrink-0"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Back to Dashboard</span>
                  <span className="xs:hidden">Back</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3 truncate">
                  <Database className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
                  <span className="truncate">General File Parser</span>
                </h1>
                <p className="text-blue-100 text-sm sm:text-base mt-1">Files stuck in the parsing process</p>
                {lastUpdated && (
                  <p className="text-blue-200 text-xs sm:text-sm mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Row - Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
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
                <RefreshCw className={`mr-1 sm:mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Refresh Data</span>
                <span className="xs:hidden">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 sm:gap-6">
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 min-w-0">
                  <span className="truncate">Stuck Files Overview</span>
                  {selectedCountry && (
                    <Flag code={selectedCountry} height={12} width={18} className="shrink-0" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 sm:gap-3">
                  {displayData && displayData.results && displayData.results.length > 0 && (
                    <Button
                      onClick={handleBulkDownload}
                      className="bg-[#00E0FF] hover:bg-[#00E0FF]/90 text-white font-semibold px-3 sm:px-4 py-1 sm:py-2 transition-all duration-200 hover:scale-105"
                      size="sm"
                    >
                      <Download className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden xs:inline">CSV</span>
                    </Button>
                  )}
                  <Badge className={`${getStatusColor(displayData?.total ?? 0)} border-0 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg font-bold`}>
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
                  <Database className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-green-600 mb-2">All Clear!</h3>
                  <p className="text-gray-600 text-sm sm:text-base px-4">
                    {selectedCountry
                      ? `No files are currently stuck in the parsing process for ${formatCountryDisplay(selectedCountry)}.`
                      : 'No files are currently stuck in the parsing process.'
                    }
                  </p>
                </div>
              ) : (
                <div>
                  {/* Alert Banner */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-400">
                    <h3 className="font-semibold text-orange-800 mb-1 text-sm sm:text-base">
                      ⚠️ {displayData.total} files require attention
                      {selectedCountry && ` in ${formatCountryDisplay(selectedCountry)}`}
                    </h3>
                    <p className="text-orange-700 text-xs sm:text-sm">
                      These files have been stuck in the parsing stage and may need manual review or processing.
                    </p>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block rounded-lg border overflow-hidden">
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

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-3">
                    {displayData.results.map((item, index) => (
                      <Card key={index} className="border border-gray-200 hover:border-[#00E0FF]/30 transition-colors duration-200">
                        <CardContent className="p-4">
                          {/* Header Row */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {item.source_channel?.country_code ? (
                                <div className='flex gap-1 items-center bg-gray-100 rounded px-2 py-1'>
                                  <Flag code={item.source_channel.country_code} height={12} width={18} />
                                  <span className="text-xs font-medium">{item.source_channel.country_code}</span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs">N/A</Badge>
                              )}
                              <span className="text-xs text-gray-500">{formatDateMobile(item.createdAt)}</span>
                            </div>
                          </div>

                          {/* Link YID */}
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Link YID</p>
                            <p className="font-mono text-sm text-gray-700 break-all">{item.link_yid}</p>
                          </div>

                          {/* URL */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">URL</p>
                            <p className="text-sm text-gray-600 break-all line-clamp-2" title={item.url}>
                              {item.url}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] transition-all duration-200"
                              onClick={() => window.open(item.url, '_blank')}
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Open
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs hover:bg-[#00E0FF]/10 hover:border-[#00E0FF] transition-all duration-200"
                              onClick={() => handleSingleDownload(item)}
                            >
                              <FileDown className="mr-1 h-3 w-3" />
                              CSV
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Results Info */}
                  {displayData.results.length >= 100 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center text-xs sm:text-sm text-blue-700">
                      Showing first 100 results. There may be more stuck files.
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