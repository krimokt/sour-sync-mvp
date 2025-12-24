"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { ArrowRight, X, ChevronLeft, CheckCircle } from 'lucide-react';
import { useDropzone } from "react-dropzone";
import { countries as countryCodes } from 'country-flag-icons';

// Helper to validate Supabase image URLs
const isValidImageUrl = (url: string | null | undefined) =>
  !!url && url.startsWith('https://cfhochnjniddaztgwrbk.supabase.co/');

// Shipping methods based on destination region
const getShippingMethods = (region: string) => {
  const methods = ["Sea Freight", "Air Freight"];
  // Only add Train Freight for European countries
  if (region === "Europe") {
    methods.push("Train Freight");
  }
  return methods;
};

// Map UI shipping methods to database values
const mapShippingMethodToDbValue = (method: string): string => {
  const mapping: Record<string, string> = {
    'Sea Freight': 'Sea',
    'Air Freight': 'Air',
    'Train Freight': 'Train'
  };
  return mapping[method] || 'Sea'; // Default to 'Sea' if no match
};

// Helper function to get emoji flag from country code
const getCountryEmoji = (countryCode: string): string => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return '🏳️'; // Default flag emoji on error
  }
};

// Function to determine region based on country code
const getRegionForCountry = (code: string): string => {
  const europeCountries = ["AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FO", "FI", "FR", "DE", "GI", "GR", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MK", "MT", "MD", "MC", "ME", "NL", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA", "GB", "VA"];
  const asiaCountries = ["AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "CY", "GE", "HK", "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MO", "MY", "MV", "MN", "MM", "NP", "KP", "OM", "PK", "PS", "PH", "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TJ", "TH", "TR", "TM", "AE", "UZ", "VN", "YE"];
  const africaCountries = ["DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CD", "CG", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "ZM", "ZW"];
  const northAmericaCountries = ["AG", "BS", "BB", "BZ", "CA", "CR", "CU", "DM", "DO", "SV", "GD", "GT", "HT", "HN", "JM", "MX", "NI", "PA", "KN", "LC", "VC", "TT", "US"];
  const southAmericaCountries = ["AR", "BO", "BR", "CL", "CO", "EC", "GY", "PY", "PE", "SR", "UY", "VE"];
  const oceaniaCountries = ["AU", "FJ", "KI", "MH", "FM", "NR", "NZ", "PW", "PG", "WS", "SB", "TO", "TV", "VU"];
  
  const upperCode = code.toUpperCase();
  if (europeCountries.includes(upperCode)) return "Europe";
  if (asiaCountries.includes(upperCode)) return "Asia";
  if (africaCountries.includes(upperCode)) return "Africa";
  if (northAmericaCountries.includes(upperCode)) return "North America";
  if (southAmericaCountries.includes(upperCode)) return "South America";
  if (oceaniaCountries.includes(upperCode)) return "Oceania";
  
  return "Other";
};

// Type for country data
interface CountryData {
  code: string;
  name: string;
  emoji: string;
  region: string;
}

interface QuotationFormModalWithTokenProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess?: () => void;
  allowedCountries?: string[]; // Array of country codes allowed by company settings
}

const QuotationFormModalWithToken: React.FC<QuotationFormModalWithTokenProps> = ({ 
  isOpen, 
  onClose, 
  token,
  onSuccess,
  allowedCountries = []
}) => {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    productUrl: "",
    quantity: "",
    productImages: [] as File[],
    destinationCountry: "",
    destinationCity: "",
    shippingMethod: "",
    serviceType: "",
  });

  // Load countries on mount, filtered by allowedCountries if provided
  useEffect(() => {
    // Generate country list from country codes with error handling
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const countryList: CountryData[] = countryCodes
      .map((code) => {
        try {
          // Filter out subdivision codes (codes with hyphens like "GB-ENG", "ES-CT")
          if (code.includes('-')) {
            return null;
          }
          
          // Validate it's a 2-letter country code
          if (code.length !== 2) {
            return null;
          }
          
          const name = displayNames.of(code.toUpperCase());
          
          // Skip if DisplayNames returns null or the code itself (invalid)
          if (!name || name === code.toUpperCase()) {
            return null;
          }
          
          // If allowedCountries is provided and not empty, filter by it
          if (allowedCountries.length > 0 && !allowedCountries.includes(code.toLowerCase())) {
            return null;
          }
          
          // Try to get emoji and region, but handle errors gracefully
          let emoji = '';
          let region = '';
          
          try {
            emoji = getCountryEmoji(code);
          } catch (error) {
            console.warn(`Failed to get emoji for ${code}:`, error);
            emoji = '🏳️'; // Default flag emoji
          }
          
          try {
            region = getRegionForCountry(code);
          } catch (error) {
            console.warn(`Failed to get region for ${code}:`, error);
            region = 'Unknown';
          }
          
          return {
            code: code.toLowerCase(),
            name: name,
            emoji: emoji,
            region: region
          };
        } catch (error) {
          // Skip invalid country codes
          console.warn(`Invalid country code: ${code}`, error);
          return null;
        }
      })
      .filter((country): country is CountryData => country !== null);
    
    // Sort countries by name
    countryList.sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name));
    setCountries(countryList);
  }, [allowedCountries]);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  // Get available shipping methods based on selected country
  const availableShippingMethods = useMemo(() => {
    if (!formData.destinationCountry) return [];
    const country = countries.find((c) => c.code === formData.destinationCountry);
    return country ? getShippingMethods(country.region) : [];
  }, [formData.destinationCountry, countries]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFormData((prev) => ({
      ...prev,
      productImages: [...prev.productImages, ...acceptedFiles],
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  // Remove image
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (step < 4) {
      // Validation for each step
      if (step === 1) {
        if (!formData.productName || !formData.quantity || !formData.serviceType) {
          alert("Please fill in all required fields");
          return;
        }
        setStep(2);
      } else if (step === 2) {
        if (!formData.destinationCountry || !formData.destinationCity) {
          alert("Please select destination country and city");
          return;
        }
        setStep(3);
      } else if (step === 3) {
        if (!formData.shippingMethod) {
          alert("Please select a shipping method");
          return;
        }
        setStep(4);
      }
      return;
    }

    // Step 4: Submit the quotation
    if (step === 4) {
      setIsSubmitting(true);
      
      try {
        // Upload images first if any
        const imageUrls: string[] = [];
        if (formData.productImages.length > 0) {
          // For token-based auth, we'll upload via API
          for (const file of formData.productImages) {
            try {
              const formDataUpload = new FormData();
              formDataUpload.append('file', file);
              formDataUpload.append('token', token);
              
              const uploadResponse = await fetch('/api/client/quotations/upload-image', {
                method: 'POST',
                body: formDataUpload,
              });

              if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
              }

              const uploadData = await uploadResponse.json();
              if (uploadData.url) {
                imageUrls.push(uploadData.url);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              // Continue with other images even if one fails
            }
          }
        }
        
        // Create the quotation via API
        const response = await fetch('/api/client/quotations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            product_name: formData.productName,
            alibaba_url: formData.productUrl,
            product_url: formData.productUrl,
            quantity: parseInt(formData.quantity, 10),
            destination_country: formData.destinationCountry,
            destination_city: formData.destinationCity,
            shipping_method: mapShippingMethodToDbValue(formData.shippingMethod),
            service_type: formData.serviceType,
            status: 'Pending',
            image_url: imageUrls.length > 0 ? imageUrls[0] : null,
            image_urls: imageUrls.length > 0 ? imageUrls : null,
            product_images: imageUrls.length > 0 ? imageUrls : null,
            quotation_id: `QT-${Date.now()}`,
            title_option1: '',
            total_price_option1: '0',
            delivery_time_option1: 'To be determined'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create quotation');
        }

        // Success! Show completion
        setStep(5);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Error submitting quotation:', error);
        alert(error instanceof Error ? error.message : 'Failed to submit quotation. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setStep(1);
    setFormData({
      productName: "",
      productUrl: "",
      quantity: "",
      productImages: [],
      destinationCountry: "",
      destinationCity: "",
      shippingMethod: "",
      serviceType: "",
    });
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-4xl p-6 lg:p-8"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 1 && "Product Information"}
            {step === 2 && "Destination Details"}
            {step === 3 && "Shipping Method"}
            {step === 4 && "Review & Submit"}
            {step === 5 && "Quotation Submitted!"}
          </h3>
          {step < 5 && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Progress Steps */}
        {step < 5 && (
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= stepNum
                        ? "bg-[#0f7aff] text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {step > stepNum ? <CheckCircle className="w-6 h-6" /> : stepNum}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stepNum === 1 && "Product"}
                    {stepNum === 2 && "Destination"}
                    {stepNum === 3 && "Shipping"}
                    {stepNum === 4 && "Review"}
                  </span>
                </div>
                {stepNum < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      step > stepNum ? "bg-[#0f7aff]" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 1: Product Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product URL (Alibaba/Other)
              </label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select service type</option>
                  <option value="sourcing">Sourcing</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="shipping">Shipping</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Images
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-[#0f7aff] bg-[#0f7aff]/5"
                    : "border-gray-300 dark:border-gray-600 hover:border-[#0f7aff]"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-gray-600 dark:text-gray-400">
                  Drag & drop images here, or click to select
                </p>
              </div>
              {formData.productImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {formData.productImages.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Product ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Destination Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Type to search countries..."
              />
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setFormData({ ...formData, destinationCountry: country.code });
                    setSearchQuery("");
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                    formData.destinationCountry === country.code
                      ? "bg-[#0f7aff]/10 border-l-4 border-[#0f7aff]"
                      : ""
                  }`}
                >
                  <span className="text-2xl">{country.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {country.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {country.code} • {country.region}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {formData.destinationCountry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destination City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.destinationCity}
                  onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter city name"
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Shipping Method */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Select Shipping Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableShippingMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setFormData({ ...formData, shippingMethod: method })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.shippingMethod === method
                        ? "border-[#0f7aff] bg-[#0f7aff]/10"
                        : "border-gray-300 dark:border-gray-600 hover:border-[#0f7aff]/50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">{method}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Review Your Quotation</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Product Name</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.productName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Quantity</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.quantity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Service Type</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.serviceType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Destination</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formData.destinationCity}, {countries.find(c => c.code === formData.destinationCountry)?.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Shipping Method</div>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.shippingMethod}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quotation Submitted Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your quotation request has been received. We'll review it and get back to you soon.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-[#0f7aff] text-white rounded-lg hover:bg-[#06b6d4] transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06b6d4] to-[#0f7aff] text-white rounded-lg hover:from-[#0f7aff] hover:to-[#06b6d4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : step === 4 ? (
                "Submit Quotation"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuotationFormModalWithToken;

