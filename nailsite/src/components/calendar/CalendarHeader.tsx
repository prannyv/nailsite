import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPrevMonth}
        className="p-2 hover:bg-pink-baby rounded-full transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="text-pink-hot" size={24} />
      </button>
      
      <h2 className="text-2xl font-semibold text-gray-800">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      
      <button
        onClick={onNextMonth}
        className="p-2 hover:bg-pink-baby rounded-full transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="text-pink-hot" size={24} />
      </button>
    </div>
  );
};

