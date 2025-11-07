import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { AppointmentCard } from './AppointmentCard';
import { getUpcomingWeekAppointments } from '../../utils/dateHelpers';
import { useStore } from '../../store/useStore';
import { useAppointmentSync } from '../../hooks/useAppointmentSync';
import type { Appointment } from '../../types/appointment';

interface AppointmentListProps {
  onEditAppointment: (appointment: Appointment) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({ onEditAppointment }) => {
  const [showAll, setShowAll] = useState(false);
  const appointments = useStore((state) => state.appointments);
  const selectedDate = useStore((state) => state.selectedDate);
  const { deleteAppointment } = useAppointmentSync();
  
  const upcomingAppointments = getUpcomingWeekAppointments(appointments);
  const upcomingIds = new Set(upcomingAppointments.map(apt => apt.id));
  
  // Exclude upcoming appointments from "Future Appointments"
  const otherAppointmentsSorted = [...appointments]
    .filter(apt => !upcomingIds.has(apt.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Handle date selection from calendar
  useEffect(() => {
    if (selectedDate) {
      // Check if any appointments exist on selected date
      const appointmentsOnDate = appointments.filter(apt => 
        isSameDay(new Date(apt.date), selectedDate)
      );
      
      if (appointmentsOnDate.length > 0) {
        // Check if any are in the future (non-upcoming) section
        const hasFutureAppointments = appointmentsOnDate.some(apt => !upcomingIds.has(apt.id));
        
        if (hasFutureAppointments) {
          // Expand future appointments section
          setShowAll(true);
        } else {
          // Appointments are in upcoming section, collapse future section
          setShowAll(false);
        }
      }
    }
  }, [selectedDate, appointments, upcomingIds]);
  
  return (
    <div className="space-y-4">
      {/* Upcoming This Week */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Upcoming This Week
        </h3>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => {
              const shouldExpand = selectedDate ? isSameDay(new Date(appointment.date), selectedDate) : false;
              return (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={onEditAppointment}
                  onDelete={deleteAppointment}
                  forceExpanded={shouldExpand}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No upcoming appointments this week</p>
        )}
      </div>
      
      {/* Future Appointments Dropdown */}
      <div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 text-gray-700 hover:text-pink-hot transition-colors font-medium"
        >
          {showAll ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          <span>Future Appointments ({otherAppointmentsSorted.length})</span>
        </button>
        
        {showAll && (
          <div className="mt-3 space-y-3">
            {otherAppointmentsSorted.length > 0 ? (
              otherAppointmentsSorted.map((appointment) => {
                const shouldExpand = selectedDate ? isSameDay(new Date(appointment.date), selectedDate) : false;
                return (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={onEditAppointment}
                    onDelete={deleteAppointment}
                    forceExpanded={shouldExpand}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-sm italic">No other appointments</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

