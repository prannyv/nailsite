import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment } from '../types/appointment';
import type { PressOn } from '../types/presson';
import type { Availability } from '../types/availability';

interface AppState {
  appointments: Appointment[];
  pressOns: PressOn[];
  availabilities: Availability[];
  selectedDate: Date | null;
  
  // Appointment actions
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  syncAppointmentsFromCalendar: (appointments: Appointment[]) => void;
  
  // Press-on actions
  addPressOn: (pressOn: PressOn) => void;
  updatePressOn: (id: string, updates: Partial<PressOn>) => void;
  deletePressOn: (id: string) => void;
  
  // Availability actions
  addAvailability: (availability: Availability) => void;
  updateAvailability: (id: string, updates: Partial<Availability>) => void;
  deleteAvailability: (id: string) => void;
  
  // Date selection
  setSelectedDate: (date: Date | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      appointments: [],
      pressOns: [],
      availabilities: [],
      selectedDate: null,
      
      // Appointment actions
      addAppointment: (appointment) =>
        set((state) => ({
          appointments: [...state.appointments, appointment],
        })),
      
      updateAppointment: (id, updates) =>
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id ? { ...apt, ...updates, updatedAt: new Date() } : apt
          ),
        })),
      
      deleteAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((apt) => apt.id !== id),
        })),
      
      syncAppointmentsFromCalendar: (syncedAppointments) =>
        set((state) => {
          // Create a map of existing appointments by their Google Calendar event ID
          const existingByEventId = new Map(
            state.appointments
              .filter((apt) => apt.googleCalendarEventId)
              .map((apt) => [apt.googleCalendarEventId!, apt])
          );

          // Merge synced appointments with existing ones
          const mergedAppointments = [...state.appointments];

          for (const syncedApt of syncedAppointments) {
            const existingApt = existingByEventId.get(syncedApt.googleCalendarEventId!);
            
            if (existingApt) {
              // Update existing appointment with synced data
              const index = mergedAppointments.findIndex(
                (apt) => apt.id === existingApt.id
              );
              if (index !== -1) {
                mergedAppointments[index] = {
                  ...existingApt,
                  ...syncedApt,
                  id: existingApt.id, // Keep the original ID
                  updatedAt: new Date(),
                };
              }
            } else {
              // Add new appointment from calendar
              mergedAppointments.push(syncedApt);
            }
          }

          return { appointments: mergedAppointments };
        }),
      
      // Press-on actions
      addPressOn: (pressOn) =>
        set((state) => ({
          pressOns: [...state.pressOns, pressOn],
        })),
      
      updatePressOn: (id, updates) =>
        set((state) => ({
          pressOns: state.pressOns.map((po) =>
            po.id === id ? { ...po, ...updates, updatedAt: new Date() } : po
          ),
        })),
      
      deletePressOn: (id) =>
        set((state) => ({
          pressOns: state.pressOns.filter((po) => po.id !== id),
        })),
      
      // Availability actions
      addAvailability: (availability) =>
        set((state) => ({
          availabilities: [...state.availabilities, availability],
        })),
      
      updateAvailability: (id, updates) =>
        set((state) => ({
          availabilities: state.availabilities.map((avail) =>
            avail.id === id ? { ...avail, ...updates, updatedAt: new Date() } : avail
          ),
        })),
      
      deleteAvailability: (id) =>
        set((state) => ({
          availabilities: state.availabilities.filter((avail) => avail.id !== id),
        })),
      
      // Date selection
      setSelectedDate: (date) =>
        set({ selectedDate: date }),
    }),
    {
      name: 'polished-by-lauren-storage',
      // Custom serialization to handle Date objects
      partialize: (state) => ({
        appointments: state.appointments,
        pressOns: state.pressOns,
        availabilities: state.availabilities,
      }),
    }
  )
);

