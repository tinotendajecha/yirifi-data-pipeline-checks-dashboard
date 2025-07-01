'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronDown, X, Search } from 'lucide-react';
import { COUNTRIES, formatCountryDisplay } from '@/lib/country-utils';
import Flag from 'react-world-flags';


interface CountryFilterProps {
  selectedCountry: string | null;
  onCountryChange: (country: string | null) => void;
}

export function CountryFilter({ selectedCountry, onCountryChange }: CountryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return COUNTRIES;

    const term = searchTerm.toLowerCase();
    return COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleCountrySelect = (countryCode: string) => {
    onCountryChange(countryCode === selectedCountry ? null : countryCode);
    setIsOpen(false);
    setSearchTerm(''); // Clear search when selecting
  };

  const clearFilter = () => {
    onCountryChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm(''); // Clear search when closing
    }
  };

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => handleOpenChange(!isOpen)}
        className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 min-w-[140px] justify-between"
      >
        {selectedCountry && selectedCountryData ? (
          <span className="flex items-center gap-2">
            <Flag code={selectedCountry} height={12} width={18} />
            <span className="font-mono text-sm">{selectedCountry}</span>
          </span>
        ) : (
          'Filter by Country'
        )}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 bg-white border-0 shadow-2xl">
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-gray-200 focus:border-[#00E0FF] focus:ring-[#00E0FF] focus:ring-1"
                  autoFocus
                />
              </div>
            </div>

            {/* Clear Filter Option */}
            {selectedCountry && (
              <div className="p-2 border-b border-gray-100">
                <Button
                  variant="ghost"
                  onClick={clearFilter}
                  className="w-full justify-start text-left mr-2 p-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  <span className='flex mr-5'>Clear Filter</span>
                  {selectedCountryData && (
                    <span className="flex items-center gap-2">
                      <Flag code={selectedCountry} height={12} width={18} />
                      <span className="font-mono text-sm">{selectedCountry}</span>
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* Countries List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                <div className="p-2">
                  {filteredCountries.map((country) => (
                    <Button
                      key={country.code}
                      variant="ghost"
                      onClick={() => handleCountrySelect(country.code)}
                      className={`w-full justify-start text-left p-3 hover:bg-[#00E0FF]/10 transition-colors duration-200 rounded-md ${selectedCountry === country.code
                          ? 'bg-[#00E0FF]/20 text-[#3000A5] font-semibold border border-[#00E0FF]/30'
                          : ''
                        }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Flag code={country.code} height={12} width={18} />
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {country.name}
                          </span>
                          {/* <span className="font-mono text-xs text-gray-500">
                            {country.code}
                          </span> */}
                        </div>
                        {selectedCountry === country.code && (
                          <Badge className="bg-[#00E0FF] text-white text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No countries found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try searching for "{searchTerm}"
                  </p>
                </div>
              )}
            </div>

            {/* Results Counter */}
            {searchTerm && (
              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  {filteredCountries.length} of {COUNTRIES.length} countries
                  {filteredCountries.length === 1 && filteredCountries.length < COUNTRIES.length && (
                    <span className="ml-1 text-[#00E0FF] font-medium">found</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => handleOpenChange(false)}
        />
      )}
    </div>
  );
}