import React from 'react';
import { isSameMonth, isToday, format } from 'date-fns';
import { getAppointmentCount, getAppointmentsForDate } from '../../utils/dateHelpers';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import type { Appointment } from '../../types/appointment';

interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  appointments: Appointment[];
  onClick: (date: Date) => void;
  isSelected: boolean;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  currentMonth,
  appointments,
  onClick,
  isSelected,
}) => {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isCurrentDay = isToday(date);
  const appointmentCount = getAppointmentCount(date, appointments);
  const hasAppointments = appointmentCount > 0;
  const dayAppointments = getAppointmentsForDate(date, appointments);
  
  const dayButton = (
    <button
      onClick={() => onClick(date)}
      className={`
        aspect-square p-2 rounded-lg transition-all w-full
        ${isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
        ${isCurrentDay ? 'border-2 border-pink-hot' : ''}
        ${isSelected ? 'bg-pink-hot text-white' : 'hover:bg-pink-baby'}
        ${!isCurrentMonth && !isSelected ? 'opacity-50' : ''}
      `}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-sm font-medium">
          {date.getDate()}
        </span>
        {hasAppointments && !isSelected && (
          <div className="mt-1 flex items-center justify-center gap-1">
            {Array.from({ length: Math.min(appointmentCount, 3) }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-pink-hot"
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );

  // Only show hover card if there are appointments
  if (!hasAppointments) {
    return dayButton;
  }
  
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        {dayButton}
      </HoverCardTrigger>
      <HoverCardContent className="w-48 p-2" align="center">
        <div className="space-y-1.5">
          {dayAppointments.map((apt) => (
            <div key={apt.id} className="text-center py-1.5 border-b border-gray-100 last:border-0">
              <p className="text-xs font-medium text-gray-500">
                {format(new Date(apt.date), 'h:mm a')}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {apt.clientName || 'No name'}
              </p>
              <p className="text-xs font-semibold text-pink-hot mt-1">
                ${apt.estimatedPrice}
              </p>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

