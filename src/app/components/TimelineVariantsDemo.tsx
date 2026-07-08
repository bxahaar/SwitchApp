import React from 'react';
import { Timeline } from './Timeline';
import { TimelineItem } from './TimelineItem';

/**
 * Timeline Component Variants Demo
 * 
 * This component showcases all available variants of the Timeline component system.
 * Use this as a reference for implementing timelines throughout your app.
 */

interface TimelineVariantsDemoProps {
  language?: 'en' | 'fa';
}

export const TimelineVariantsDemo: React.FC<TimelineVariantsDemoProps> = ({ 
  language = 'en' 
}) => {
  // Sample data for demonstration
  const sampleItems = [
    { id: 1, label: 'Sep 19, 2023', content: 'Oil Change Service' },
    { id: 2, label: 'Dec 25, 2022', content: 'Brake Inspection' },
    { id: 3, label: 'Dec 2, 2024', content: 'Engine Service' }
  ];

  const sampleItemsPersian = [
    { id: 1, label: '۱۹ شهریور ۱۴۰۲', content: 'تعویض روغن' },
    { id: 2, label: '۲۵ دی ۱۴۰۱', content: 'بازرسی ترمز' },
    { id: 3, label: '۱۱ آذر ۱۴۰۳', content: 'سرویس موتور' }
  ];

  const items = language === 'fa' ? sampleItemsPersian : sampleItems;

  return (
    <div className="space-y-12 p-6">
      <div>
        <h1 className="text-2xl mb-2">Timeline Component Variants</h1>
        <p className="text-muted-foreground mb-8">
          Explore different timeline styles for various use cases
        </p>
      </div>

      {/* Default Variant */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl mb-1">Default Variant</h2>
          <p className="text-sm text-muted-foreground">
            Standard spacing (49px) • 24px bullets • Best for service history
          </p>
        </div>
        <div className="bg-card border border-border/70 rounded-xl p-6">
          <Timeline language={language} variant="default">
            {items.map((item) => (
              <TimelineItem
                key={item.id}
                label={item.label}
                language={language}
                variant="default"
              >
                <div className="bg-background border border-border/70 rounded-xl p-4">
                  <p className="text-foreground">{item.content}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Standard card content
                  </p>
                </div>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </section>

      {/* Compact Variant */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl mb-1">Compact Variant</h2>
          <p className="text-sm text-muted-foreground">
            Tight spacing (24px) • 20px bullets • Best for dense information
          </p>
        </div>
        <div className="bg-card border border-border/70 rounded-xl p-6">
          <Timeline language={language} variant="compact">
            {items.map((item) => (
              <TimelineItem
                key={item.id}
                label={item.label}
                language={language}
                variant="compact"
              >
                <div className="bg-background border border-border/70 rounded-xl p-3">
                  <p className="text-sm text-foreground">{item.content}</p>
                </div>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </section>

      {/* Detailed Variant */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl mb-1">Detailed Variant</h2>
          <p className="text-sm text-muted-foreground">
            Spacious layout (64px) • 32px bullets • Best for featured content
          </p>
        </div>
        <div className="bg-card border border-border/70 rounded-xl p-6">
          <Timeline language={language} variant="detailed">
            {items.map((item) => (
              <TimelineItem
                key={item.id}
                label={item.label}
                language={language}
                variant="detailed"
              >
                <div className="bg-background border border-border/70 rounded-xl p-6">
                  <p className="text-lg text-foreground">{item.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Detailed description with more spacing for emphasis
                  </p>
                </div>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </section>

      {/* Without Vertical Line */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl mb-1">Without Timeline Line</h2>
          <p className="text-sm text-muted-foreground">
            Clean layout without vertical line • Best for minimal designs
          </p>
        </div>
        <div className="bg-card border border-border/70 rounded-xl p-6">
          <Timeline language={language} variant="default" showLine={false}>
            {items.map((item) => (
              <TimelineItem
                key={item.id}
                label={item.label}
                language={language}
                variant="default"
              >
                <div className="bg-background border border-border/70 rounded-xl p-4">
                  <p className="text-foreground">{item.content}</p>
                </div>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </section>

      {/* Custom Content */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl mb-1">Custom Content Types</h2>
          <p className="text-sm text-muted-foreground">
            Timeline accepts any React children • Mix different content types
          </p>
        </div>
        <div className="bg-card border border-border/70 rounded-xl p-6">
          <Timeline language={language} variant="default">
            <TimelineItem
              label="Today"
              language={language}
              variant="default"
            >
              <div className="bg-success/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-700 dark:text-green-400">✓ Completed Service</p>
              </div>
            </TimelineItem>
            <TimelineItem
              label="Next Week"
              language={language}
              variant="default"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-700 dark:text-yellow-400">⏰ Upcoming Reminder</p>
              </div>
            </TimelineItem>
            <TimelineItem
              label="Future"
              language={language}
              variant="default"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-700 dark:text-blue-400">📅 Scheduled Maintenance</p>
              </div>
            </TimelineItem>
          </Timeline>
        </div>
      </section>

      {/* Usage Example */}
      <section className="bg-secondary/70 rounded-xl p-6 space-y-4">
        <h2 className="text-xl">Usage Example</h2>
        <pre className="bg-background border border-border/70 rounded-xl p-4 overflow-x-auto text-xs">
{`import { Timeline } from './components/Timeline';
import { TimelineItem } from './components/TimelineItem';

<Timeline language={language} variant="default">
  {items.map((item) => (
    <TimelineItem
      key={item.id}
      label={item.date}
      language={language}
      variant="default"
    >
      <YourCustomContent data={item} />
    </TimelineItem>
  ))}
</Timeline>`}
        </pre>
      </section>

      {/* Props Documentation */}
      <section className="space-y-4">
        <h2 className="text-xl">Component Props</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Timeline Props</h3>
            <div className="bg-card border border-border/70 rounded-xl p-4 space-y-2 text-sm">
              <div><code className="bg-secondary px-2 py-1 rounded">language</code> - 'en' | 'fa' (required)</div>
              <div><code className="bg-secondary px-2 py-1 rounded">variant</code> - 'default' | 'compact' | 'detailed' (optional, default: 'default')</div>
              <div><code className="bg-secondary px-2 py-1 rounded">minHeight</code> - string (optional, default: '260px')</div>
              <div><code className="bg-secondary px-2 py-1 rounded">showLine</code> - boolean (optional, default: true)</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">TimelineItem Props</h3>
            <div className="bg-card border border-border/70 rounded-xl p-4 space-y-2 text-sm">
              <div><code className="bg-secondary px-2 py-1 rounded">label</code> - string (required)</div>
              <div><code className="bg-secondary px-2 py-1 rounded">language</code> - 'en' | 'fa' (required)</div>
              <div><code className="bg-secondary px-2 py-1 rounded">variant</code> - 'default' | 'compact' | 'detailed' (optional, default: 'default')</div>
              <div><code className="bg-secondary px-2 py-1 rounded">children</code> - React.ReactNode (required)</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
