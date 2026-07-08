import React from 'react';

export interface TimelineProps {
  /** Timeline items as children (typically TimelineItem components) */
  children: React.ReactNode;
  /** Language direction for RTL/LTR support */
  language: 'en' | 'fa';
  /** Variant determines spacing and visual style */
  variant?: 'default' | 'compact' | 'detailed';
  /** Minimum height of the timeline container */
  minHeight?: string;
  /** Show or hide the vertical line */
  showLine?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  children,
  language,
  variant = 'default',
  minHeight = '260px',
  showLine = true
}) => {
  // Spacing between timeline items based on variant
  const itemSpacing = {
    default: '49px',
    compact: '24px',
    detailed: '64px'
  };
  
  const spacing = itemSpacing[variant];
  
  return (
    <div className="relative w-full" style={{ minHeight }}>
      {/* Vertical timeline line */}
      {showLine && (
        <>
          {language === 'fa' && (
            <div 
              className="absolute bg-border rounded-[8px]" 
              style={{ 
                right: '12px',
                top: '12px',
                bottom: '12px',
                width: '2px'
              }} 
            />
          )}
          {language === 'en' && (
            <div 
              className="absolute bg-border rounded-[8px]" 
              style={{ 
                left: '12px',
                top: '12px',
                bottom: '12px',
                width: '2px'
              }} 
            />
          )}
        </>
      )}
      
      {/* Timeline items with variant-based spacing */}
      <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
        {children}
      </div>
    </div>
  );
};