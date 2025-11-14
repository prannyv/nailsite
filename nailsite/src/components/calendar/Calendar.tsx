import React, { useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import { getDaysInMonth } from '../../utils/dateHelpers';
import { useStore } from '../../store/useStore';
import type { Availability } from '../../types/availability';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  onAvailabilityClick?: (availability: Availability) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onAvailabilityClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const appointments = useStore((state) => state.appointments);
  const availabilities = useStore((state) => state.availabilities);
  const selectedDate = useStore((state) => state.selectedDate);
  const setSelectedDate = useStore((state) => state.setSelectedDate);
  
  const days = getDaysInMonth(currentMonth);
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleAvailabilityClick = (availability: Availability) => {
    if (onAvailabilityClick) {
      onAvailabilityClick(availability);
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <CalendarHeader
        currentDate={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => (
          <CalendarDay
            key={index}
            date={date}
            currentMonth={currentMonth}
            appointments={appointments}
            availabilities={availabilities}
            onClick={handleDayClick}
            onAvailabilityClick={handleAvailabilityClick}
            isSelected={selectedDate ? date.toDateString() === selectedDate.toDateString() : false}
          />
        ))}
      </div>
    </div>
  );
};

