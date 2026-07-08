import React from 'react';

export interface TimelineItemProps {
  /** Label/date to display next to the bullet */
  label: string;
  /** Content to display below the label */
  children: React.ReactNode;
  /** Language direction */
  language: 'en' | 'fa';
  /** Variant style */
  variant?: 'default' | 'compact' | 'detailed';
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  label,
  children,
  language,
  variant = 'default'
}) => {
  // Bullet sizes based on variant
  const bulletSizes = {
    default: { outer: 24, inner: 10 },
    compact: { outer: 20, inner: 8 },
    detailed: { outer: 32, inner: 14 }
  };
  
  // Content indentation based on variant
  const contentIndent = {
    default: '48px',
    compact: '40px',
    detailed: '56px'
  };
  
  const sizes = bulletSizes[variant];
  const indent = contentIndent[variant];
  
  return (
    <div className="relative w-full">
      {/* Label with bullet - aligned based on language */}
      <div 
        className="relative flex items-center"
        style={{ 
          marginBottom: variant === 'compact' ? '6px' : '8px',
          minHeight: `${sizes.outer}px`
        }}
      >
        {language === 'fa' ? (
          <>
            {/* Date text - positioned on the right with margin */}
            <span 
              className="text-sm text-muted-foreground"
              style={{ 
                position: 'absolute',
                right: `${sizes.outer + 12}px` // bullet width + gap
              }}
            >
              {label}
            </span>
            {/* Bullet on right - aligned with timeline */}
            <div 
              className="absolute bg-muted-foreground rounded-full flex items-center justify-center flex-shrink-0" 
              style={{ 
                width: `${sizes.outer}px`, 
                height: `${sizes.outer}px`,
                right: `${12 - sizes.outer / 2}px` // Center bullet on timeline line at right: 12px
              }}
            >
              <div 
                className="bg-background rounded-full border-[1.4px] border-muted-foreground" 
                style={{ width: `${sizes.inner}px`, height: `${sizes.inner}px` }} 
              />
            </div>
          </>
        ) : (
          <>
            {/* Bullet on left - aligned with timeline */}
            <div 
              className="absolute bg-muted-foreground rounded-full flex items-center justify-center flex-shrink-0" 
              style={{ 
                width: `${sizes.outer}px`, 
                height: `${sizes.outer}px`,
                left: `${12 - sizes.outer / 2}px` // Center bullet on timeline line at left: 12px
              }}
            >
              <div 
                className="bg-background rounded-full border-[1.4px] border-muted-foreground" 
                style={{ width: `${sizes.inner}px`, height: `${sizes.inner}px` }} 
              />
            </div>
            {/* Date text - positioned on the left with margin */}
            <span 
              className="text-sm text-muted-foreground"
              style={{ 
                position: 'absolute',
                left: `${sizes.outer + 12}px` // bullet width + gap
              }}
            >
              {label}
            </span>
          </>
        )}
      </div>
      
      {/* Content - NO CHANGES to service card width */}
      <div>
        {children}
      </div>
    </div>
  );
};