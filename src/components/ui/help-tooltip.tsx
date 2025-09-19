import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface HelpTooltipProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  shortcuts?: string[];
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  position = 'top',
  shortcuts = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-50 w-80 ${positionClasses[position]}`}
          >
            <Card className="p-4 shadow-lg border-2 bg-white/95 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 -mt-1 -mr-1"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {content}
              </p>
              
              {shortcuts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">Raccourcis :</div>
                  <div className="flex flex-wrap gap-1">
                    {shortcuts.map((shortcut, index) => (
                      <kbd
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono border"
                      >
                        {shortcut}
                      </kbd>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Arrow pointer */}
              <div
                className={`absolute w-2 h-2 bg-white border transform rotate-45 ${
                  position === 'top' 
                    ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r-0 border-b-0'
                    : position === 'bottom'
                    ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l-0 border-t-0'
                    : position === 'left'
                    ? 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-l-0'
                    : 'right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0'
                }`}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpTooltip;
