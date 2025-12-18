'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { countries as countryCodes } from 'country-flag-icons';
import { CloseIcon } from '@/icons';

// Helper function to get emoji flag from country code
const getCountryEmoji = (countryCode: string): string => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.warn(`Failed to generate emoji for country code: ${countryCode}`, error);
    return '🏳️'; // Default flag emoji
  }
};

// Type for country data
interface CountryData {
  code: string;
  name: string;
  emoji: string;
}

interface QuotationSettingsProps {
  companyId: string;
  initialCountries?: string[];
  initialInputFields?: string[];
}

// Available quotation input fields
const QUOTATION_FIELDS = [
  { id: 'product_name', label: 'Product Name', required: true },
  { id: 'product_url', label: 'Product URL', required: false },
  { id: 'quantity', label: 'Quantity', required: true },
  { id: 'product_images', label: 'Product Images', required: false },
  { id: 'variant_specs', label: 'Variant/Specs', required: false },
  { id: 'notes', label: 'Notes', required: false },
] as const;

export default function QuotationSettings({ companyId, initialCountries = [], initialInputFields = ['product_name', 'product_url', 'quantity', 'product_images', 'variant_specs', 'notes'] }: QuotationSettingsProps) {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountries);
  const [selectedInputFields, setSelectedInputFields] = useState<string[]>(initialInputFields);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Generate country list from country codes
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const countryList: CountryData[] = countryCodes
      .map((code) => {
        try {
          const name = displayNames.of(code);
          if (!name) return null;
          
          return {
            code: code.toLowerCase(),
            name: name,
            emoji: getCountryEmoji(code)
          };
        } catch (error) {
          console.warn(`Invalid country code: ${code}`, error);
          return null;
        }
      })
      .filter((country): country is CountryData => country !== null);
    
    // Sort countries by name
    countryList.sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name));
    setCountries(countryList);
  }, []);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    
    return countries.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countries, searchQuery]);

  const toggleCountry = (countryCode: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryCode)) {
        return prev.filter(code => code !== countryCode);
      } else {
        return [...prev, countryCode];
      }
    });
  };

  const toggleInputField = (fieldId: string) => {
    const field = QUOTATION_FIELDS.find(f => f.id === fieldId);
    // Don't allow disabling required fields
    if (field?.required) return;
    
    setSelectedInputFields(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          quotation_countries: selectedCountries,
          quotation_input_fields: selectedInputFields
        })
        .eq('id', companyId);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Quotation settings saved successfully!' });
    } catch (error) {
      console.error('Error saving quotation settings:', error);
      setMessage({ type: 'error', text: 'Failed to save quotation settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Quotation Settings
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Select Countries</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Choose the countries you want to accept quotations for
          </p>
          
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-[#06b6d4] dark:bg-gray-800 dark:border-gray-600 dark:text-white flex items-center justify-between"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {selectedCountries.length > 0 
                  ? `${selectedCountries.length} countr${selectedCountries.length === 1 ? 'y' : 'ies'} selected`
                  : 'Select countries...'}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-[300px] overflow-hidden">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-[#06b6d4] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="overflow-y-auto max-h-[250px]">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No countries found
                    </div>
                  ) : (
                    filteredCountries.map((country) => {
                      const isSelected = selectedCountries.includes(country.code);
                      return (
                        <div
                          key={country.code}
                          onClick={() => toggleCountry(country.code)}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            isSelected
                              ? 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20'
                              : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCountry(country.code)}
                            className="w-4 h-4 text-[#06b6d4] border-gray-300 rounded focus:ring-[#06b6d4] dark:border-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xl">{country.emoji}</span>
                          <span className="flex-1 text-gray-800 dark:text-white">{country.name}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedCountries.length > 0 && (
          <div>
            <Label>Selected Countries ({selectedCountries.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCountries.map((countryCode) => {
                const country = countries.find(c => c.code === countryCode);
                if (!country) return null;
                return (
                  <div
                    key={countryCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 text-[#06b6d4] rounded-full text-sm"
                  >
                    <span>{country.emoji}</span>
                    <span>{country.name}</span>
                    <button
                      onClick={() => toggleCountry(countryCode)}
                      className="ml-1 hover:bg-[#06b6d4]/20 rounded-full p-0.5 transition-colors"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quotation Input Fields Selection */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Label>Quotation Form Fields</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select which fields should be shown in the quotation form
          </p>
          
          <div className="space-y-2">
            {QUOTATION_FIELDS.map((field) => {
              const isSelected = selectedInputFields.includes(field.id);
              const isRequired = field.required;
              
              return (
                <div
                  key={field.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    isSelected
                      ? 'border-[#06b6d4] bg-[#06b6d4]/5 dark:bg-[#06b6d4]/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  } ${isRequired ? 'opacity-75' : 'cursor-pointer'}`}
                  onClick={() => !isRequired && toggleInputField(field.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !isRequired && toggleInputField(field.id)}
                    disabled={isRequired}
                    className="w-4 h-4 text-[#06b6d4] border-gray-300 rounded focus:ring-[#06b6d4] dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="flex-1 text-gray-800 dark:text-white">
                    {field.label}
                    {isRequired && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Required)</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Quotation Settings'}
        </Button>
      </div>
    </div>
  );
}



