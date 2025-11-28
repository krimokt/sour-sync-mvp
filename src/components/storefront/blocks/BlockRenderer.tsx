import React from 'react';
import { WebsiteBlock, BlockSettings } from '@/types/website';
import Link from 'next/link';

interface BlockRendererProps {
  block: WebsiteBlock;
  themeColor: string;
}

export default function BlockRenderer({ block, themeColor }: BlockRendererProps) {
  const settings = block.settings || {};

  // Generate style object from settings
  const style = getBlockStyles(settings);

  switch (block.type) {
    case 'title':
      return <TitleBlock text={String(block.data?.text || '')} settings={settings} style={style} />;
    
    case 'subtitle':
      return <SubtitleBlock text={String(block.data?.text || '')} settings={settings} style={style} />;
    
    case 'text':
      return <TextBlock text={String(block.data?.text || '')} settings={settings} style={style} />;
    
    case 'image':
      return (
        <ImageBlock 
          src={String(block.data?.src || '')} 
          alt={String(block.data?.alt || '')} 
          settings={settings}
          style={style}
        />
      );
    
    case 'button':
      return (
        <ButtonBlock 
          text={String(block.data?.text || 'Button')} 
          link={String(block.data?.link || '#')}
          settings={settings}
          themeColor={themeColor}
          style={style}
        />
      );
    
    case 'service-item':
      return (
        <ServiceItemBlock
          title={String(block.data?.title || '')}
          description={String(block.data?.description || '')}
          icon={block.data?.icon ? String(block.data.icon) : undefined}
          themeColor={themeColor}
          style={style}
        />
      );
    
    case 'divider':
      return <DividerBlock dividerStyle={String(block.data?.style || 'solid')} style={style} />;
    
    case 'spacer':
      return <SpacerBlock height={Number(block.data?.height) || 32} style={style} />;
    
    default:
      return null;
  }
}

// ============================================
// HELPER FUNCTION
// ============================================

function getBlockStyles(settings: BlockSettings): React.CSSProperties {
  const style: React.CSSProperties = {};

  // Spacing
  if (settings.marginTop) style.marginTop = `${settings.marginTop}px`;
  if (settings.marginBottom) style.marginBottom = `${settings.marginBottom}px`;
  if (settings.paddingTop) style.paddingTop = `${settings.paddingTop}px`;
  if (settings.paddingBottom) style.paddingBottom = `${settings.paddingBottom}px`;
  if (settings.paddingLeft) style.paddingLeft = `${settings.paddingLeft}px`;
  if (settings.paddingRight) style.paddingRight = `${settings.paddingRight}px`;

  // Background
  if (settings.backgroundColor) style.backgroundColor = settings.backgroundColor;
  if (settings.borderRadius) style.borderRadius = `${settings.borderRadius}px`;

  return style;
}

function getFontSizeClass(size?: BlockSettings['fontSize']): string {
  const sizes: Record<string, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };
  return sizes[size || 'base'] || 'text-base';
}

function getFontWeightClass(weight?: BlockSettings['fontWeight']): string {
  const weights: Record<string, string> = {
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold',
  };
  return weights[weight || 'normal'] || 'font-normal';
}

function getTextAlignClass(align?: BlockSettings['textAlign']): string {
  const aligns: Record<string, string> = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  };
  return aligns[align || 'left'] || 'text-left';
}

// ============================================
// BLOCK COMPONENTS
// ============================================

function TitleBlock({ 
  text, 
  settings, 
  style 
}: { 
  text: string; 
  settings: BlockSettings;
  style: React.CSSProperties;
}) {
  const fontSize = getFontSizeClass(settings.fontSize || '3xl');
  const fontWeight = getFontWeightClass(settings.fontWeight || 'bold');
  const textAlign = getTextAlignClass(settings.textAlign || 'center');
  
  return (
    <h2 
      className={`${fontSize} ${fontWeight} ${textAlign} text-gray-900`}
      style={{ ...style, color: settings.textColor }}
    >
      {text}
    </h2>
  );
}

function SubtitleBlock({ 
  text, 
  settings, 
  style 
}: { 
  text: string; 
  settings: BlockSettings;
  style: React.CSSProperties;
}) {
  const fontSize = getFontSizeClass(settings.fontSize || 'lg');
  const fontWeight = getFontWeightClass(settings.fontWeight || 'normal');
  const textAlign = getTextAlignClass(settings.textAlign || 'center');
  
  return (
    <p 
      className={`${fontSize} ${fontWeight} ${textAlign}`}
      style={{ ...style, color: settings.textColor || '#6B7280' }}
    >
      {text}
    </p>
  );
}

function TextBlock({ 
  text, 
  settings, 
  style 
}: { 
  text: string; 
  settings: BlockSettings;
  style: React.CSSProperties;
}) {
  const fontSize = getFontSizeClass(settings.fontSize || 'base');
  const fontWeight = getFontWeightClass(settings.fontWeight);
  const textAlign = getTextAlignClass(settings.textAlign);
  
  // Handle line breaks
  const lines = text.split('\n');
  
  return (
    <div 
      className={`${fontSize} ${fontWeight} ${textAlign} text-gray-600 leading-relaxed`}
      style={{ ...style, color: settings.textColor }}
    >
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}

function ImageBlock({ 
  src, 
  alt, 
  settings,
  style 
}: { 
  src: string; 
  alt: string; 
  settings: BlockSettings;
  style: React.CSSProperties;
}) {
  if (!src) {
    return (
      <div 
        className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center"
        style={style}
      >
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  const widthClass = settings.imageWidth === 'half' ? 'w-1/2' : 
                     settings.imageWidth === 'auto' ? 'w-auto' : 'w-full';
  const objectFitClass = settings.objectFit === 'contain' ? 'object-contain' :
                         settings.objectFit === 'fill' ? 'object-fill' : 'object-cover';

  return (
    <div className={`${widthClass} mx-auto`} style={style}>
      <img
        src={src}
        alt={alt}
        className={`w-full ${objectFitClass}`}
        style={{ borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined }}
      />
    </div>
  );
}

function ButtonBlock({ 
  text, 
  link, 
  settings,
  themeColor,
  style 
}: { 
  text: string; 
  link: string;
  settings: BlockSettings;
  themeColor: string;
  style: React.CSSProperties;
}) {
  const textAlign = getTextAlignClass(settings.textAlign || 'center');
  
  // Button variant styles
  const variant = settings.buttonVariant || 'primary';
  const size = settings.buttonSize || 'md';

  const sizeClasses: Record<string, string> = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: themeColor, color: 'white' };
      case 'secondary':
        return { backgroundColor: '#374151', color: 'white' };
      case 'outline':
        return { backgroundColor: 'transparent', border: `2px solid ${themeColor}`, color: themeColor };
      default:
        return { backgroundColor: themeColor, color: 'white' };
    }
  };

  const isExternal = link.startsWith('http');
  const buttonClasses = `inline-flex items-center justify-center ${sizeClasses[size]} rounded-lg font-medium transition-transform hover:scale-105`;

  const button = (
    <span 
      className={buttonClasses}
      style={getVariantStyles()}
    >
      {text}
    </span>
  );

  return (
    <div className={textAlign} style={style}>
      {isExternal ? (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {button}
        </a>
      ) : (
        <Link href={link}>
          {button}
        </Link>
      )}
    </div>
  );
}

function ServiceItemBlock({ 
  title, 
  description, 
  icon,
  themeColor,
  style 
}: { 
  title: string; 
  description: string; 
  icon?: string;
  themeColor: string;
  style: React.CSSProperties;
}) {
  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
      style={style}
    >
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white font-bold"
        style={{ backgroundColor: themeColor }}
      >
        {icon || '✦'}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function DividerBlock({ 
  dividerStyle, 
  style 
}: { 
  dividerStyle: string;
  style: React.CSSProperties;
}) {
  return (
    <hr 
      className="border-gray-200"
      style={{ 
        ...style, 
        borderStyle: dividerStyle as 'solid' | 'dashed' | 'dotted',
      }}
    />
  );
}

function SpacerBlock({ 
  height, 
  style 
}: { 
  height: number;
  style: React.CSSProperties;
}) {
  return <div style={{ ...style, height: `${height}px` }} />;
}

