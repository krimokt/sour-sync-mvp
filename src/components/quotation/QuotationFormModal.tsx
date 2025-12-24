"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { 
  CloseIcon
} from "@/icons";
import { useDropzone } from "react-dropzone";
import { countries as countryCodes } from 'country-flag-icons';
import { supabase } from "@/lib/supabase";
import { VariantGroup, VariantValue } from '@/types/database';
import { Plus, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useParams } from 'next/navigation';
import {
  Stepper,
  StepperItem,
  StepperNav,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
} from '@/components/ui/stepper';

// Type for company with quotation settings
type CompanyWithSettings = {
  id: string;
  quotation_countries?: string[] | null;
  quotation_input_fields?: string[] | null;
} | null;

// Helper to validate Supabase image URLs
const isValidImageUrl = (url: string | null | undefined) =>
  !!url && url.startsWith('https://cfhochnjniddaztgwrbk.supabase.co/');

// Removed unused getShippingMethods function

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

interface QuotationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuotationFormModal: React.FC<QuotationFormModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [companySettings, setCompanySettings] = useState<{
    quotation_countries?: string[] | null;
    quotation_input_fields?: string[] | null;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Get company slug from URL params (for client pages)
  const params = useParams();
  const companySlugFromUrl = params?.companySlug as string | undefined;
  
  // Note: ClientContext is not used here to avoid conditional hook usage
  // Company data will be fetched via URL slug or profile instead
  
  // Try to get company from StoreContext, but don't fail if not available
  let storeCompany: CompanyWithSettings = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const store = useStore();
    storeCompany = store?.company as CompanyWithSettings;
  } catch {
    // StoreContext not available, will fetch company data
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userProfile, setUserProfile] = useState<{
    address?: string | null;
    city?: string | null;
    country?: string | null;
  } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [previousAddresses, setPreviousAddresses] = useState<Array<{
    id: string;
    full_name: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    country: string;
    phone: string | null;
    is_default: boolean;
  }>>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressData, setAddressData] = useState({
    receiverName: '',
    address: '',
    city: '',
    country: ''
  });
  // Address is saved automatically on form submission, no need for separate saving state
  const [formData, setFormData] = useState({
    productName: "",
    productUrl: "",
    quantity: "",
    productImages: [] as File[],
    destinationCountry: "",
    destinationCity: "",
    shippingMethod: "",
    serviceType: "",
    variantGroups: [] as VariantGroup[],
  });
  const [variantValueImages, setVariantValueImages] = useState<Record<string, File | null>>({});
  
  // Handle variant value image upload
  const handleVariantValueImageChange = (valueId: string, file: File | null) => {
    setVariantValueImages(prev => ({
      ...prev,
      [valueId]: file
    }));
  };

  const removeVariantValueImage = (valueId: string) => {
    setVariantValueImages(prev => {
      const newImages = { ...prev };
      delete newImages[valueId];
      return newImages;
    });
    // Also remove from variant value images array
    const groupIndex = formData.variantGroups.findIndex(g => 
      g.values.some(v => v.id === valueId)
    );
    if (groupIndex !== -1) {
      const valueIndex = formData.variantGroups[groupIndex].values.findIndex(v => v.id === valueId);
      if (valueIndex !== -1) {
        updateVariantValue(groupIndex, valueIndex, 'images', []);
      }
    }
  };

  // Drag and drop handlers for variant value images
  const [draggedVariantValueId, setDraggedVariantValueId] = useState<string | null>(null);

  const handleVariantImageDrag = (e: React.DragEvent, valueId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDraggedVariantValueId(valueId);
    } else if (e.type === 'dragleave') {
      setDraggedVariantValueId(null);
    }
  };

  const handleVariantImageDrop = (e: React.DragEvent, valueId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedVariantValueId(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleVariantValueImageChange(valueId, file);
      }
    }
  };
  
  useEffect(() => {
    // Generate country list from country codes with error handling
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
          
          const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
          const name = displayNames.of(code.toUpperCase());
          
          // Skip if DisplayNames returns null or the code itself (invalid)
          if (!name || name === code.toUpperCase()) {
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
  }, []);
  
  // Fetch user profile data when modal opens
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isOpen) return;
      
      setIsLoadingProfile(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('address, city, country, full_name')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
          } else if (profile) {
            setUserProfile(profile);
            // Auto-populate address data and form data with profile address
            setAddressData({
              receiverName: profile.full_name || '',
              address: profile.address || '',
              city: profile.city || '',
              country: profile.country || ''
            });
            if (profile.country) {
              setFormData(prev => ({
                ...prev,
                destinationCountry: profile.country?.toLowerCase() || '',
                destinationCity: profile.city || ''
              }));
            }
          } else {
            // No profile found, initialize empty address data
            setAddressData({
              receiverName: '',
              address: '',
              city: '',
              country: ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [isOpen]);

  // Fetch previous addresses from client_addresses table
  useEffect(() => {
    const fetchPreviousAddresses = async () => {
      if (!isOpen) return;
      
      setIsLoadingAddresses(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          // Get company_id first (needed for client_addresses query)
          let finalCompanyId = companyId;
          
          // Try from URL slug if not set
          if (!finalCompanyId && companySlugFromUrl) {
            const { data: company } = await supabase
              .from('companies')
              .select('id')
              .eq('slug', companySlugFromUrl)
              .maybeSingle();
            if (company?.id) {
              finalCompanyId = company.id;
            }
          }
          
          // Try from user profile if still not set
          if (!finalCompanyId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('company_id')
              .eq('id', session.user.id)
              .maybeSingle();
            if (profile?.company_id) {
              finalCompanyId = profile.company_id;
            }
          }
          
          // Try from clients table if still not set
          if (!finalCompanyId) {
            const { data: client } = await supabase
              .from('clients')
              .select('company_id')
              .eq('user_id', session.user.id)
              .eq('status', 'active')
              .maybeSingle();
            if (client?.company_id) {
              finalCompanyId = client.company_id;
            }
          }
          
          // If we have company_id, fetch addresses
          if (finalCompanyId) {
            const { data: addresses, error } = await supabase
              .from('client_addresses')
              .select('id, full_name, address_line_1, address_line_2, city, country, phone, is_default')
              .eq('user_id', session.user.id)
              .eq('company_id', finalCompanyId)
              .order('is_default', { ascending: false })
              .order('created_at', { ascending: false });
            
            if (error) {
              console.error('Error fetching previous addresses:', error);
            } else if (addresses) {
              setPreviousAddresses(addresses);
            }
          } else {
            // No company_id found, set empty addresses
            setPreviousAddresses([]);
          }
        }
      } catch (error) {
        console.error('Error fetching previous addresses:', error);
        setPreviousAddresses([]);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    
    fetchPreviousAddresses();
  }, [isOpen, companyId, companySlugFromUrl]);

  // Fetch company settings (quotation_countries and quotation_input_fields)
  useEffect(() => {
    const fetchCompanySettings = async () => {
      if (!isOpen) return;
      
      setIsLoadingSettings(true);
      try {
        let companyId: string | null = null;
        let companyData: { quotation_countries?: string[] | null; quotation_input_fields?: string[] | null } | null = null;
        
        // Priority 1: Try to get company from StoreContext
        if (storeCompany?.id) {
          companyId = storeCompany.id;
          companyData = {
            quotation_countries: storeCompany.quotation_countries || null,
            quotation_input_fields: storeCompany.quotation_input_fields || null
          };
        }
        // Priority 2: Try to get company from URL slug (for client pages)
        if (!companyData && companySlugFromUrl) {
          const { data: company, error } = await supabase
            .from('companies')
            .select('id, quotation_countries, quotation_input_fields')
            .eq('slug', companySlugFromUrl)
            .single();
          
          if (error) {
            console.error('Error fetching company by slug:', error);
          } else if (company) {
            companyId = company.id;
            companyData = {
              quotation_countries: company.quotation_countries,
              quotation_input_fields: company.quotation_input_fields
            };
          }
        }
        // Priority 3: Fetch from user's profile
        if (!companyData) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('company_id')
              .eq('id', session.user.id)
              .single();
            
            if (profile?.company_id) {
              companyId = profile.company_id;
              
              // Fetch company settings
              const { data: company, error } = await supabase
                .from('companies')
                .select('quotation_countries, quotation_input_fields')
                .eq('id', companyId)
                .single();
              
              if (error) {
                console.error('Error fetching company settings:', error);
              } else if (company) {
                companyData = {
                  quotation_countries: company.quotation_countries,
                  quotation_input_fields: company.quotation_input_fields
                };
              }
            }
          }
        }
        
        // Set company settings if we found them
        if (companyData) {
          setCompanySettings(companyData);
          if (companyId) {
            setCompanyId(companyId);
          }
          console.log('Company settings loaded:', {
            company_id: companyId,
            quotation_countries: companyData.quotation_countries,
            quotation_input_fields: companyData.quotation_input_fields,
            source: storeCompany ? 'StoreContext' : companySlugFromUrl ? 'URL slug' : 'Profile'
          });
        } else {
          console.log('No company settings found');
        }
      } catch (error) {
        console.error('Error fetching company settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    fetchCompanySettings();
  }, [isOpen, storeCompany, companySlugFromUrl]);

  // Filter countries based on search query and company settings
  const filteredCountries = useMemo(() => {
    let filtered = countries;
    
    // Filter by company's quotation_countries if set
    if (companySettings?.quotation_countries && Array.isArray(companySettings.quotation_countries) && companySettings.quotation_countries.length > 0) {
      const allowedCodes = companySettings.quotation_countries.map(c => String(c).toLowerCase().trim()).filter(Boolean);
      filtered = filtered.filter(country => {
        const countryCode = country.code.toLowerCase().trim();
        return allowedCodes.includes(countryCode);
      });
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    }
    
    return filtered;
  }, [countries, searchQuery, companySettings]);
  
  // Removed unused getCountryRegion function

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "destinationCountry") {
      // Reset shipping method when country changes
      setFormData({
        ...formData,
        [name]: value,
        shippingMethod: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsCountryDropdownOpen(true); // Keep dropdown open when typing
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown-container')) {
        setIsCountryDropdownOpen(false);
      }
    };
    
    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  // Handle file upload with dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFormData(prev => ({
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

  // Add a function to remove an image by index
  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Variant Group functions
  const addVariantGroup = () => {
    const newGroup: VariantGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      values: [],
    };
    setFormData(prev => ({
      ...prev,
      variantGroups: [...prev.variantGroups, newGroup],
    }));
  };

  const updateVariantGroup = (index: number, field: keyof VariantGroup, value: string) => {
    const newGroups = [...formData.variantGroups];
    (newGroups[index] as VariantGroup)[field as keyof VariantGroup] = value as never;
    setFormData(prev => ({
      ...prev,
      variantGroups: newGroups,
    }));
  };

  const removeVariantGroup = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variantGroups: prev.variantGroups.filter((_, i) => i !== index),
    }));
  };

  const addVariantValue = (groupIndex: number) => {
    const newGroups = [...formData.variantGroups];
    const newValue: VariantValue = {
      id: `value-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
    };
    newGroups[groupIndex].values.push(newValue);
    setFormData(prev => ({
      ...prev,
      variantGroups: newGroups,
    }));
  };

  const updateVariantValue = (groupIndex: number, valueIndex: number, field: keyof VariantValue, value: string | string[] | number | undefined) => {
    const newGroups = [...formData.variantGroups];
    const variantValue = newGroups[groupIndex].values[valueIndex];
    if (variantValue) {
      (variantValue as VariantValue)[field] = value as never;
    }
    setFormData(prev => ({
      ...prev,
      variantGroups: newGroups,
    }));
  };

  // Removed unused removeVariantValue function - variant values are managed via updateVariantValue

  // Navigate to next step
  const nextStep = () => {
    // Validate fields for the current step
    if (step === 1) {
      if (!formData.productName.trim()) {
        alert("Please enter a product name");
        return;
      }
      if (!formData.quantity.trim() || isNaN(parseInt(formData.quantity, 10))) {
        alert("Please enter a valid quantity (must be a number)");
        return;
      }
    } else if (step === 2) {
      // Validate that address information is provided
      if (!addressData.receiverName.trim() || !addressData.address.trim() || !addressData.city.trim() || !addressData.country) {
        alert("Please fill in all address fields (receiver name, address, city, and country)");
        return;
      }
    }
    
    setStep(step + 1);
  };

  // Navigate to previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Reset form to initial state
  const resetForm = () => {
    setStep(1);
    setFormData({
      productName: "",
      productUrl: "",
      quantity: "",
      productImages: [] as File[],
      destinationCountry: "",
      destinationCity: "",
      shippingMethod: "",
      serviceType: "",
      variantGroups: [] as VariantGroup[],
    });
    setAddressData({
      receiverName: '',
      address: '',
      city: '',
      country: ''
    });
    setVariantValueImages({});
    setIsSubmitting(false);
    setSearchQuery("");
    setIsCountryDropdownOpen(false);
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.productName.trim()) {
      alert("Please enter a product name");
      setStep(1);
      return;
    }
    
    // Validate quantity is a number
    if (!formData.quantity.trim() || isNaN(parseInt(formData.quantity, 10))) {
      alert("Please enter a valid quantity (must be a number)");
      setStep(1);
      return;
    }
    
    // Validate that address information is provided
    if (!addressData.receiverName.trim() || !addressData.address.trim() || !addressData.city.trim() || !addressData.country) {
      alert("Please fill in all address fields (receiver name, address, city, and country)");
      setStep(2);
      return;
    }
    
    // Save address to client_addresses table
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        // Get company_id (needed for client_addresses)
        let finalCompanyId = companyId;
        if (!finalCompanyId && companySlugFromUrl) {
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('slug', companySlugFromUrl)
            .maybeSingle();
          if (company?.id) {
            finalCompanyId = company.id;
          }
        }
        
        // Try from user profile if still not set
        if (!finalCompanyId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', sessionData.session.user.id)
            .maybeSingle();
          if (profile?.company_id) {
            finalCompanyId = profile.company_id;
          }
        }
        
        // Try from clients table if still not set
        if (!finalCompanyId) {
          const { data: client } = await supabase
            .from('clients')
            .select('company_id')
            .eq('user_id', sessionData.session.user.id)
            .eq('status', 'active')
            .maybeSingle();
          if (client?.company_id) {
            finalCompanyId = client.company_id;
          }
        }
        
        // Save to client_addresses if we have company_id
        if (finalCompanyId) {
          // Check if this exact address already exists
          const { data: existingAddress } = await supabase
            .from('client_addresses')
            .select('id')
            .eq('user_id', sessionData.session.user.id)
            .eq('company_id', finalCompanyId)
            .eq('address_line_1', addressData.address)
            .eq('city', addressData.city)
            .eq('country', addressData.country.toUpperCase())
            .maybeSingle();
          
          if (!existingAddress) {
            // Only create new address if it doesn't exist
            const { error: addressError } = await supabase
              .from('client_addresses')
              .insert({
                user_id: sessionData.session.user.id,
                company_id: finalCompanyId,
                full_name: addressData.receiverName,
                address_line_1: addressData.address,
                city: addressData.city,
                country: addressData.country.toUpperCase(),
                is_default: previousAddresses.length === 0, // Set as default if it's the first address
              });
            
            if (addressError) {
              console.error('Error saving address to client_addresses:', addressError);
            } else {
              // Refresh previous addresses list
              const { data: addresses } = await supabase
                .from('client_addresses')
                .select('id, full_name, address_line_1, address_line_2, city, country, phone, is_default')
                .eq('user_id', sessionData.session.user.id)
                .eq('company_id', finalCompanyId)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });
              
              if (addresses) {
                setPreviousAddresses(addresses);
              }
            }
          }
        }
        
        // Also update profile for backward compatibility
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: addressData.receiverName,
            address: addressData.address,
            city: addressData.city,
            country: addressData.country.toUpperCase(),
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionData.session.user.id);
        
        if (updateError) {
          console.error('Error saving address to profile:', updateError);
          // Continue with quotation submission even if profile update fails
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      // Continue with quotation submission even if address save fails
    }
    
    // Shipping method is no longer required as we use personal address
    
    if (!formData.serviceType) {
      alert("Please select a service type");
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Upload product images first if any
      const imageUrls: string[] = [];
      if (formData.productImages.length > 0) {
        for (const file of formData.productImages) {
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;
            
            // Upload the file to the quotation images bucket
            const { error: uploadError } = await supabase.storage
              .from('quotation_images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (uploadError) {
              console.error('Upload error details:', uploadError);
              throw new Error(`Error uploading image: ${uploadError.message}`);
            }
            
            // Get the public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
              .from('quotation_images')
              .getPublicUrl(filePath);
            
            if (publicUrl) {
              imageUrls.push(publicUrl);
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
          }
        }
      }

      // Upload variant value images and update variant groups
      const processedVariantGroups = await Promise.all(
        formData.variantGroups
          .filter(g => g.name && g.values.length > 0)
          .map(async (group) => {
            const processedValues = await Promise.all(
              group.values.map(async (value) => {
                let imageUrls: string[] = [];
                
                // Upload new image file if exists
                if (variantValueImages[value.id]) {
                  try {
                    const file = variantValueImages[value.id]!;
                    const fileExt = file.name.split('.').pop();
                    const fileName = `variant-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `${fileName}`;
                    
                    const { error: uploadError } = await supabase.storage
                      .from('quotation_images')
                      .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                      });
                    
                    if (!uploadError) {
                      const { data: { publicUrl } } = supabase.storage
                        .from('quotation_images')
                        .getPublicUrl(filePath);
                      
                      if (publicUrl) {
                        imageUrls = [publicUrl];
                      }
                    }
                  } catch (error) {
                    console.error('Error uploading variant image:', error);
                    // Keep existing images if upload fails
                    imageUrls = value.images || [];
                  }
                } else {
                  // Keep existing images if no new file
                  imageUrls = value.images || [];
                }
                
                return {
                  ...value,
                  images: imageUrls
                };
              })
            );
            
            return {
              ...group,
              values: processedValues
            };
          })
      );
      
      // Get company_id - try multiple sources to ensure we have it for RLS policy
      let finalCompanyId = companyId;
      if (!finalCompanyId && sessionData?.session?.user?.id) {
        // Try to get company_id from user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (profile?.company_id) {
          finalCompanyId = profile.company_id;
        } else {
          // Try to get company_id from clients table (for client users)
          const { data: client } = await supabase
            .from('clients')
            .select('company_id')
            .eq('user_id', sessionData.session.user.id)
            .eq('status', 'active')
            .maybeSingle();
          
          if (client?.company_id) {
            finalCompanyId = client.company_id;
          }
        }
      }
      
      // If still no company_id and we have a company slug from URL, fetch it
      // Note: This will only work if the user has access to this company (checked by RLS)
      if (!finalCompanyId && companySlugFromUrl) {
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('slug', companySlugFromUrl)
          .maybeSingle();
        
        if (company?.id) {
          finalCompanyId = company.id;
        }
      }
      
      // Validate that we have a company_id (required for RLS policy)
      if (!finalCompanyId) {
        throw new Error('Unable to determine company. Please ensure you are associated with a company or accessing the correct company page.');
      }
      
      // Create the quotation record
      console.log('Debug - formData shipping method:', formData.shippingMethod);
      console.log('Debug - company_id for insert:', finalCompanyId);
      
      const { data: quotationData, error: insertError } = await supabase
        .from('quotations')
        .insert({
          product_name: formData.productName,
          product_url: formData.productUrl,
          quantity: parseInt(formData.quantity, 10),
          shipping_country: addressData.country.toUpperCase(),
          shipping_city: addressData.city,
          destination_country: addressData.country.toUpperCase(),
          destination_city: addressData.city,
          shipping_method: formData.shippingMethod ? mapShippingMethodToDbValue(formData.shippingMethod) : 'Air', // Default to Air if not set
          service_type: formData.serviceType,
          status: 'Pending',
          image_url: imageUrls.length > 0 ? imageUrls[0] : null,
          user_id: sessionData?.session?.user?.id,
          company_id: finalCompanyId, // Required for RLS policy
          quotation_id: `QT-${Date.now()}`,
          title_option1: '',
          total_price_option1: '0',
          delivery_time_option1: 'To be determined',
          variant_groups: processedVariantGroups.length > 0 ? processedVariantGroups : null
        } as never)
        .select();
        
      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(`Failed to submit quotation: ${insertError.message}`);
      }

      // Store the generated UUID for reference (if needed in future)
      if (quotationData && quotationData.length > 0) {
        const first = (quotationData as unknown as Array<{ id: string }>)[0];
        console.log('Generated quotation ID:', first.id);
      }

      // Success! Move to completion step
      setStep(4);
    } catch (error) {
      console.error('Error submitting quotation:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="max-w-3xl h-auto mx-auto p-4 sm:p-6 overflow-hidden">
      {/* Modal header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#096CC8] dark:text-white">Create New Quotation</h2>
        <button 
          onClick={onClose}
          className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Stepper - Top */}
      {step <= 3 && (
        <Stepper value={step} onValueChange={(value) => {
          // Only allow going back, not forward by clicking steps
          if (value < step) {
            setStep(value);
          }
        }}>
          <StepperNav className="gap-3.5 mb-4">
            <StepperItem step={1} completed={step > 1} className="relative flex-1 items-start">
              <StepperTrigger className="flex flex-col items-start justify-center gap-3.5 grow w-full">
                <StepperIndicator className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 w-full data-[state=active]:bg-[#006cff] data-[state=active]:dark:bg-blue-500 data-[state=completed]:bg-[#006cff] data-[state=completed]:dark:bg-blue-500 transition-all duration-300"></StepperIndicator>
                <div className="flex flex-col items-start gap-1">
                  <StepperTitle className="text-start font-semibold text-gray-900 dark:text-white group-data-[state=inactive]/step:text-gray-400 dark:group-data-[state=inactive]/step:text-gray-500 text-xs transition-colors">
                    Step 1
                  </StepperTitle>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperItem step={2} completed={step > 2} className="relative flex-1 items-start">
              <StepperTrigger className="flex flex-col items-start justify-center gap-3.5 grow w-full">
                <StepperIndicator className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 w-full data-[state=active]:bg-[#006cff] data-[state=active]:dark:bg-blue-500 data-[state=completed]:bg-[#006cff] data-[state=completed]:dark:bg-blue-500 transition-all duration-300"></StepperIndicator>
                <div className="flex flex-col items-start gap-1">
                  <StepperTitle className="text-start font-semibold text-gray-900 dark:text-white group-data-[state=inactive]/step:text-gray-400 dark:group-data-[state=inactive]/step:text-gray-500 text-xs transition-colors">
                    Step 2
                  </StepperTitle>
                </div>
              </StepperTrigger>
            </StepperItem>
            <StepperItem step={3} className="relative flex-1 items-start">
              <StepperTrigger className="flex flex-col items-start justify-center gap-3.5 grow w-full">
                <StepperIndicator className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 w-full data-[state=active]:bg-[#006cff] data-[state=active]:dark:bg-blue-500 data-[state=completed]:bg-[#006cff] data-[state=completed]:dark:bg-blue-500 transition-all duration-300"></StepperIndicator>
                <div className="flex flex-col items-start gap-1">
                  <StepperTitle className="text-start font-semibold text-gray-900 dark:text-white group-data-[state=inactive]/step:text-gray-400 dark:group-data-[state=inactive]/step:text-gray-500 text-xs transition-colors">
                    Step 3
                  </StepperTitle>
                </div>
              </StepperTrigger>
            </StepperItem>
          </StepperNav>
        </Stepper>
      )}

      {/* Form content */}
      <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-1 py-2">
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Step 1: Product Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Product Information</h3>
              
              {/* Helper function to check if field should be shown */}
              {(() => {
                const shouldShowField = (fieldId: string) => {
                  // If no settings, show all fields (backward compatibility)
                  if (!companySettings?.quotation_input_fields || companySettings.quotation_input_fields.length === 0) {
                    return true;
                  }
                  return companySettings.quotation_input_fields.includes(fieldId);
                };
                
                return (
                  <>
                    {shouldShowField('product_name') && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                  placeholder="Enter product name"
                  required
                />
              </div>
                    )}
              
                    {shouldShowField('product_url') && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alibaba Product URL*
                </label>
                <input
                  type="text"
                  name="productUrl"
                  value={formData.productUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                  placeholder="https://www.alibaba.com/product/..."
                />
              </div>
                    )}
              
                    {shouldShowField('quantity') && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity Required *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder="Enter quantity"
                  required
                />
              </div>
                    )}
                  </>
                );
              })()}
              
              {(() => {
                const shouldShowField = (fieldId: string) => {
                  if (!companySettings?.quotation_input_fields || companySettings.quotation_input_fields.length === 0) {
                    return true;
                  }
                  return companySettings.quotation_input_fields.includes(fieldId);
                };
                return shouldShowField('product_images') ? (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Images
                </label>
                <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-[#1E88E5] dark:border-gray-700 rounded-xl hover:border-[#1E88E5]">
                  <div
                    {...getRootProps()}
                    className={`dropzone rounded-xl border-dashed border-gray-300 p-4 ${
                      isDragActive
                        ? "border-[#1E88E5] bg-gray-100 dark:bg-gray-800"
                        : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                    }`}
                  >
                    {/* Hidden Input */}
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center">
                      {/* Icon Container */}
                      <div className="mb-4 flex justify-center text-[#9B4646]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-[#024EB1] dark:bg-gray-800 dark:text-gray-400">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 29 28"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Text Content */}
                      <h4 className="mb-2 font-medium text-gray-800 dark:text-white/90">
                        {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
                      </h4>

                      <span className="text-center mb-3 block w-full max-w-[290px] text-sm text-gray-500 dark:text-gray-400">
                        Drag and drop your PNG, JPG, WebP, SVG images here or browse
                      </span>

                      <span className="font-medium underline text-sm text-[#1E88E5]">
                        Browse File
                      </span>
                    </div>
                  </div>
                </div>
                
                {formData.productImages.length > 0 && (
                  <div className="mt-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploaded Images ({formData.productImages.length})
                    </label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {formData.productImages.map((file, index) => {
                        // For File objects, create a blob URL for preview
                        // File objects are always valid for preview
                        const imageUrl = file instanceof File 
                          ? URL.createObjectURL(file)
                          : (typeof file === 'string' && isValidImageUrl(file) ? file : null);
                        
                        return (
                          <div key={index} className="relative w-24 h-24 overflow-hidden rounded-md group">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-40 bg-gray-200 text-gray-500 rounded">
                                <span style={{fontSize: '2rem'}}>📷</span>
                                <span>No Photo Uploaded</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg
                                className="w-3 h-3 text-white"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                  </div>
                ) : null;
              })()}

              {/* Variant Groups Section - Always shown as it's not in quotation_input_fields */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Variant Groups
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Create groups like Color, Size, Material, etc.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantGroup}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#1E88E5] hover:text-[#1976D2] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Group
                  </button>
                </div>

                {formData.variantGroups.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 border-dashed rounded-lg">
                    <p className="text-sm">No variant groups added</p>
                    <p className="text-xs mt-1">Examples: Color, Size, Material, Voltage, Packaging</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.variantGroups.map((group, groupIndex) => (
                      <div key={group.id} className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateVariantGroup(groupIndex, 'name', e.target.value)}
                            placeholder="Group name (e.g., Color, Size)"
                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantGroup(groupIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {group.values.map((value, valueIndex) => (
                            <div key={value.id} className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md">
                              <div className="grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-4">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Value Name
                                  </label>
                                  <input
                                    type="text"
                                    value={value.name}
                                    onChange={(e) => updateVariantValue(groupIndex, valueIndex, 'name', e.target.value)}
                                    placeholder="e.g., Black, White, S, M"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                
                                <div className="col-span-3">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    MOQ (Optional)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={value.moq || ''}
                                    onChange={(e) => updateVariantValue(groupIndex, valueIndex, 'moq', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="MOQ"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  />
                                </div>
                                
                                <div className="col-span-5">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Image (Optional)
                                  </label>
                                  <div className="min-h-[80px]">
                                    {variantValueImages[value.id] || (value.images && value.images.length > 0) ? (
                                      <div className="relative">
                                        <div className="relative w-20 h-20 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600 group">
                                          {variantValueImages[value.id] ? (
                                            <Image
                                              src={URL.createObjectURL(variantValueImages[value.id]!)}
                                              alt={`Variant image`}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : value.images && value.images[0] ? (
                                            <Image
                                              src={value.images[0]}
                                              alt={`Variant image`}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : null}
                                          <button
                                            type="button"
                                            onClick={() => removeVariantValueImage(value.id)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X className="w-3 h-3 text-white" />
                                          </button>
                                        </div>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            handleVariantValueImageChange(value.id, file);
                                          }}
                                          className="hidden"
                                          id={`variant-image-${value.id}`}
                                        />
                                        <label
                                          htmlFor={`variant-image-${value.id}`}
                                          className="mt-2 block text-xs text-[#1E88E5] hover:text-[#1976D2] cursor-pointer underline"
                                        >
                                          Change image
                                        </label>
                                      </div>
                                    ) : (
                                      <div>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            handleVariantValueImageChange(value.id, file);
                                          }}
                                          className="hidden"
                                          id={`variant-image-${value.id}`}
                                        />
                                        <div
                                          onDragEnter={(e) => handleVariantImageDrag(e, value.id)}
                                          onDragOver={(e) => handleVariantImageDrag(e, value.id)}
                                          onDragLeave={(e) => handleVariantImageDrag(e, value.id)}
                                          onDrop={(e) => handleVariantImageDrop(e, value.id)}
                                          className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                                            draggedVariantValueId === value.id
                                              ? "border-[#1E88E5] bg-blue-50 dark:bg-blue-900/20"
                                              : "border-gray-300 dark:border-gray-600 hover:border-[#1E88E5] dark:hover:border-[#1E88E5]"
                                          }`}
                                          onClick={() => document.getElementById(`variant-image-${value.id}`)?.click()}
                                        >
                                          <svg
                                            className="w-6 h-6 text-gray-400 mb-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                          </svg>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {draggedVariantValueId === value.id ? "Drop image here" : "Click or drag to upload"}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={() => addVariantValue(groupIndex)}
                            className="w-full px-3 py-2 text-sm text-[#1E88E5] hover:text-[#1976D2] hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-dashed border-gray-300 dark:border-gray-600 rounded-md transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Value
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Personal Address Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Address Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter your address information. This will be saved to your profile for future quotations.
              </p>
              
              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E88E5]"></div>
                </div>
              ) : (
                <>
                  {/* Previous Addresses Section */}
                  {!isLoadingAddresses && previousAddresses.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select a Previous Address
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {previousAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setAddressData({
                                receiverName: addr.full_name || '',
                                address: addr.address_line_1 || '',
                                city: addr.city || '',
                                country: addr.country || ''
                              });
                            }}
                            className="text-left p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#1E88E5] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                  {addr.full_name || 'Unnamed Address'}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {addr.address_line_1}
                                  {addr.address_line_2 && `, ${addr.address_line_2}`}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {addr.city}, {addr.country}
                                </div>
                              </div>
                              {addr.is_default && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
              <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receiver Name *
                </label>
                        <input
                          type="text"
                          value={addressData.receiverName}
                          onChange={(e) => setAddressData(prev => ({ ...prev, receiverName: e.target.value }))}
                          placeholder="Enter receiver's full name"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={addressData.address}
                          onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter your address"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={addressData.city}
                          onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter your city"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5]"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Country *
                        </label>
                        <div className="mb-4 relative country-dropdown-container">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                            onFocus={() => setIsCountryDropdownOpen(true)}
                            onClick={() => setIsCountryDropdownOpen(true)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors mb-2"
                  />
                  
                          {isCountryDropdownOpen && filteredCountries.length > 0 && (
                            <div className="absolute z-10 w-full h-[200px] overflow-y-auto border border-gray-300 rounded-md bg-white dark:bg-gray-800 shadow-lg">
                    {filteredCountries.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => {
                                    setAddressData(prev => ({ ...prev, country: country.code }));
                          setSearchQuery("");
                                    setIsCountryDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    addressData.country === country.code
                            ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        <span className="text-xl">{country.emoji}</span>
                        <span>{country.name}</span>
                      </div>
                    ))}
                  </div>
                          )}
                          {isCountryDropdownOpen && filteredCountries.length === 0 && (
                            <div className="absolute z-10 w-full border border-gray-300 rounded-md bg-white dark:bg-gray-800 shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
                              {searchQuery.trim() 
                                ? "No countries found matching your search"
                                : companySettings?.quotation_countries && companySettings.quotation_countries.length > 0
                                  ? "No countries available. Please contact support to add countries to your quotation settings."
                                  : "No countries found"}
                </div>
                          )}
              </div>
                        {addressData.country && (
                          <div className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="text-xl">{getCountryEmoji(addressData.country.toUpperCase())}</span>
                            <span>{countries.find(c => c.code === addressData.country?.toLowerCase())?.name || addressData.country}</span>
                            <button
                              type="button"
                      onClick={() => {
                                setAddressData(prev => ({ ...prev, country: '' }));
                                setSearchQuery('');
                              }}
                              className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                    </div>
                        )}
                      </div>
                </div>
              </div>
                </>
              )}
            </div>
          )}
          
          {/* Step 3: Service Details */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Service Details</h3>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-[#2A2727] dark:text-gray-300">
                  Service Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Sourcing", "Shipping Only"].map((service) => (
                    <div
                      key={service}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          serviceType: service
                        });
                      }}
                      className={`flex items-center justify-center gap-2 p-3 cursor-pointer border rounded-md transition-colors ${
                        formData.serviceType === service
                          ? "border-[#1E88E5] bg-blue-50 text-[#1E88E5] dark:bg-blue-900 dark:text-blue-200"
                          : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600 text-[#1E88E5] dark:text-blue-400"
                      }`}
                    >
                      {service}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Product:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Quantity:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Address:</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {addressData.address ? `${addressData.address}, ${addressData.city}, ${countries.find(c => c.code === addressData.country?.toLowerCase())?.name || addressData.country}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Service:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formData.serviceType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Completion */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 px-4 min-h-[400px]">
              <div className="text-center max-w-md w-full">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Quotation Submitted Successfully
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Your quotation has been submitted and is being reviewed. You will receive a response via email shortly.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2 mb-8 inline-block">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Status: <span className="font-medium">Pending Review</span>
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 bg-[#006cff] hover:bg-[#0052cc] dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full font-medium text-sm transition-colors"
                  >
                    Create New Quotation
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Navigation Buttons */}
      {step <= 3 && (
        <div className="flex items-center justify-center gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-200 flex items-center justify-center bg-gray-100 dark:bg-gray-800 font-semibold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm border border-gray-200 dark:border-gray-700"
            >
              Back
            </button>
          )}
          <button
            type={step === 3 ? "button" : "button"}
            onClick={step === 3 ? (e) => {
              e.preventDefault();
              if (formRef.current) {
                formRef.current.requestSubmit();
              }
            } : (e) => {
              e.preventDefault();
              nextStep();
            }}
            disabled={isSubmitting || (step === 3 && !formData.serviceType)}
            className="px-6 py-2.5 rounded-full text-white bg-[#006cff] hover:bg-[#0052cc] dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm font-semibold shadow-sm my-2.5"
          >
            {isSubmitting ? 'Submitting...' : (step === 3 ? 'Finish' : 'Continue')}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default QuotationFormModal;