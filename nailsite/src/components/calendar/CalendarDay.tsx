import React, { useState } from 'react';
import { isSameMonth, isToday, format, isSameDay } from 'date-fns';
import { getAppointmentCount, getAppointmentsForDate } from '../../utils/dateHelpers';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import type { Appointment } from '../../types/appointment';
import type { Availability } from '../../types/availability';

interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  appointments: Appointment[];
  availabilities: Availability[];
  onClick: (date: Date) => void;
  onAvailabilityClick: (availability: Availability) => void;
  isSelected: boolean;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  currentMonth,
  appointments,
  availabilities,
  onClick,
  onAvailabilityClick,
  isSelected,
}) => {
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isCurrentDay = isToday(date);
  const appointmentCount = getAppointmentCount(date, appointments);
  const hasAppointments = appointmentCount > 0;
  const dayAppointments = getAppointmentsForDate(date, appointments);
  
  // Check for availabilities on this date
  const dayAvailabilities = availabilities.filter(avail => 
    isSameDay(new Date(avail.date), date)
  );
  const hasAvailabilities = dayAvailabilities.length > 0;
  
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
        {(hasAppointments || hasAvailabilities) && !isSelected && (
          <div className="mt-1 flex items-center justify-center gap-1">
            {/* Pink dots for appointments */}
            {hasAppointments && Array.from({ length: Math.min(appointmentCount, 3) }).map((_, i) => (
              <div
                key={`apt-${i}`}
                className="w-1.5 h-1.5 rounded-full bg-pink-hot"
              />
            ))}
            {/* Blue dots for availabilities */}
            {hasAvailabilities && Array.from({ length: Math.min(dayAvailabilities.length, 3) }).map((_, i) => (
              <div
                key={`avail-${i}`}
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );

  // Only show hover card if there are appointments or availabilities
  if (!hasAppointments && !hasAvailabilities) {
    return dayButton;
  }
  
  return (
    <HoverCard open={isHoverOpen} onOpenChange={setIsHoverOpen} openDelay={300}>
      <HoverCardTrigger asChild>
        {dayButton}
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-2" align="center">
        <div className="space-y-1.5">
          {/* Show appointments */}
          {dayAppointments.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-700 px-2 py-1">Appointments</p>
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
            </>
          )}
          
          {/* Show availabilities */}
          {dayAvailabilities.length > 0 && (
            <>
              {dayAppointments.length > 0 && <div className="border-t border-gray-200 my-2" />}
              <p className="text-xs font-bold text-gray-700 px-2 py-1">Availabilities</p>
              {dayAvailabilities.map((avail) => (
                <button
                  key={avail.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHoverOpen(false);
                    onAvailabilityClick(avail);
                  }}
                  className="w-full text-center py-1.5 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-medium text-blue-500">
                    {avail.startTime}
                  </p>
                  <p className="text-xs text-gray-500">Available</p>
                </button>
              ))}
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

