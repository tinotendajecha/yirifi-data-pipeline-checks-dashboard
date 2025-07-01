// CSV utility functions for downloading data
export interface CSVData {
  link_yid: string;
  url: string;
  country_code?: string;
  createdAt: string;
}

export function convertToCSV(data: CSVData[]): string {
  if (!data || data.length === 0) {
    return 'Link YID,URL,Country Code,Created At\n';
  }

  const headers = ['Link YID', 'URL', 'Country Code', 'Created At'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      `"${row.link_yid}"`,
      `"${row.url.replace(/"/g, '""')}"`, // Escape quotes in URLs
      `"${row.country_code || 'N/A'}"`,
      `"${new Date(row.createdAt).toLocaleString()}"`
    ].join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(data: CSVData[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data available to download');
    return;
  }

  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function generateFilename(prefix: string, count?: number): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const countSuffix = count !== undefined ? `-${count}-items` : '';
  return `${prefix}${countSuffix}-${timestamp}.csv`;
}

export function downloadSingleRow(item: CSVData, prefix: string): void {
  const filename = generateFilename(`${prefix}-${item.link_yid}`);
  downloadCSV([item], filename);
}