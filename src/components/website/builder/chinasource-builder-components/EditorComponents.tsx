'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Truck, Shield, Handshake, Globe, Box, 
  CheckCircle, Phone, Mail, MapPin, MessageSquare, 
  Users, CreditCard, TrendingUp, Award, Clock, Upload, X, Check
} from 'lucide-react';
import { ThemeColor } from '../chinasource-types';

// --- Icon System ---
export const ICON_MAP: Record<string, React.ElementType> = {
  search: Search,
  truck: Truck,
  shield: Shield,
  handshake: Handshake,
  globe: Globe,
  box: Box,
  users: Users,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  award: Award,
  clock: Clock,
  check: CheckCircle,
  phone: Phone,
  mail: Mail,
  'map-pin': MapPin,
  'message-square': MessageSquare,
};

const ICON_KEYS = Object.keys(ICON_MAP);

// --- Editable Text Component ---
interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export const EditableText: React.FC<EditableTextProps> = ({ value, onChange, className, tag: Tag = 'span' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <Tag
      ref={inputRef}
      className={`${className} ${isEditing ? 'outline-dashed outline-2 outline-blue-500 bg-blue-50/50 min-w-[20px]' : 'hover:outline-dashed hover:outline-1 hover:outline-gray-300 cursor-text'}`}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setIsEditing(true)}
      onBlur={(e) => {
        setLocalValue(e.currentTarget.textContent || '');
        handleBlur();
      }}
      onKeyDown={handleKeyDown}
    >
      {value}
    </Tag>
  );
};

// --- Editable Image Component ---
interface EditableImageProps {
  src: string;
  alt: string;
  onChange: (newSrc: string) => void;
  className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({ src, alt, onChange, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onChange(url);
      setShowEditor(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput) {
      onChange(urlInput);
      setShowEditor(false);
    }
  };

  return (
    <div 
      className={`relative group ${className}`} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      
      {isHovered && !showEditor && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
             onClick={() => setShowEditor(true)}>
          <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <Upload size={14} /> Change Image
          </span>
        </div>
      )}

      {showEditor && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-2xl z-50 w-64 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-sm">Edit Image</h4>
            <button onClick={(e) => { e.stopPropagation(); setShowEditor(false); }}><X size={16} /></button>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-sm py-2 rounded mb-3 flex items-center justify-center gap-2"
          >
            <Upload size={14} /> Upload File
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />

          <div className="text-xs text-center text-gray-400 mb-2">- OR -</div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Paste Image URL" 
              className="border p-1 text-sm rounded w-full"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); handleUrlSubmit(); }} className="bg-blue-600 text-white p-1 rounded">
              <Check size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Editable Icon Component ---
interface EditableIconProps {
  iconName: string;
  onChange: (newIcon: string) => void;
  className?: string;
  themeColor: ThemeColor;
}

export const EditableIcon: React.FC<EditableIconProps> = ({ iconName, onChange, className, themeColor }) => {
  const [showPicker, setShowPicker] = useState(false);
  const IconComponent = ICON_MAP[iconName] || Box;

  // Simple contrast logic for picker
  const pickerBorderColor = themeColor === 'amber' ? 'border-amber-500' : 'border-blue-500';

  return (
    <div className="relative inline-block">
      <div 
        className={`cursor-pointer hover:scale-110 transition active:scale-95 ${className}`}
        onClick={() => setShowPicker(!showPicker)}
        title="Click to change icon"
      >
        <IconComponent className="w-full h-full" />
      </div>

      {showPicker && (
        <div className={`absolute left-0 top-full mt-2 z-50 bg-white p-3 rounded-lg shadow-xl border-2 ${pickerBorderColor} w-64`}>
          <div className="flex justify-between items-center mb-2 pb-2 border-b">
             <span className="text-xs font-bold text-gray-500 uppercase">Select Icon</span>
             <button onClick={() => setShowPicker(false)}><X size={14} /></button>
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
            {ICON_KEYS.map((key) => {
              const I = ICON_MAP[key];
              return (
                <button 
                  key={key}
                  onClick={() => { onChange(key); setShowPicker(false); }}
                  className={`p-2 rounded hover:bg-gray-100 flex justify-center ${key === iconName ? 'bg-gray-200' : ''}`}
                  title={key}
                >
                  <I size={20} className="text-gray-700" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};