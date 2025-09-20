import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NutritionCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAddEntry: () => void;
  entriesByDate: { [key: string]: number }; // date -> number of entries
  waterByDate: { [key: string]: number }; // date -> glasses of water
}

const NutritionCalendar: React.FC<NutritionCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onAddEntry,
  entriesByDate,
  waterByDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hasEntries = entriesByDate[dateStr] > 0;
    const hasWater = waterByDate[dateStr] > 0;
    const isSelected = isSameDay(day, selectedDate);
    const isToday = isSameDay(day, new Date());

    return {
      hasEntries,
      hasWater,
      isSelected,
      isToday
    };
  };

  const getDayColor = (day: Date) => {
    const { hasEntries, hasWater, isSelected, isToday } = getDayStatus(day);

    if (isSelected) return 'bg-blue-600 text-white';
    if (isToday) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-600';
    if (hasEntries && hasWater) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (hasEntries || hasWater) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    return 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Aujourd'hui
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day) => {
          const { hasEntries, hasWater, isSelected, isToday } = getDayStatus(day);
          const dateStr = format(day, 'yyyy-MM-dd');
          const entryCount = entriesByDate[dateStr] || 0;
          const waterCount = waterByDate[dateStr] || 0;

          return (
            <Button
              key={day.toISOString()}
              variant="ghost"
              className={`h-16 p-1 flex flex-col items-center justify-start ${getDayColor(day)}`}
              onClick={() => onDateSelect(day)}
            >
              <div className="text-sm font-medium">
                {format(day, 'd')}
              </div>
              
              <div className="flex flex-col items-center space-y-1 mt-1">
                {hasEntries && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-1 py-0 h-4"
                  >
                    {entryCount}
                  </Badge>
                )}
                
                {hasWater && (
                  <div className="text-xs opacity-75">
                    💧 {waterCount}
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>Repas + Eau</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span>Repas ou Eau</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Aujourd'hui</span>
            </div>
          </div>
          
          <Button onClick={onAddEntry} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NutritionCalendar;
