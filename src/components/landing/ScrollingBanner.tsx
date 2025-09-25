import React, { useState, useEffect, useRef } from 'react';

interface ScrollingBannerProps {
  children: React.ReactNode[];
  speed?: number;
  className?: string;
}

export const ScrollingBanner = ({ children, speed = 1, className = '' }: ScrollingBannerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const scrollPosition = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Calculate the width of one set of children
    const firstChild = container.querySelector('.banner-item:first-child') as HTMLElement;
    const oneSetWidth = firstChild ? firstChild.offsetWidth * children.length + (6 * (children.length - 1)) : 0;

    const animate = () => {
      if (!isHovered && container) {
        scrollPosition.current += speed;
        
        // Reset to 0 when we've scrolled one complete set
        if (scrollPosition.current >= oneSetWidth) {
          scrollPosition.current = 0;
        }
        
        container.scrollLeft = scrollPosition.current;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, speed, children.length]);

  return (
    <div
      ref={containerRef}
      className={`overflow-x-hidden scrollbar-hide ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-6" style={{ width: 'max-content' }}>
        {/* Duplicate children for seamless loop */}
        {children.map((child, idx) => (
          <div key={`first-${idx}`} className="banner-item">
            {child}
          </div>
        ))}
        {children.map((child, idx) => (
          <div key={`second-${idx}`} className="banner-item">
            {child}
          </div>
        ))}
        {children.map((child, idx) => (
          <div key={`third-${idx}`} className="banner-item">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
