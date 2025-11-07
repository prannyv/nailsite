import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment } from '../types/appointment';
import type { PressOn } from '../types/presson';

interface AppState {
  appointments: Appointment[];
  pressOns: PressOn[];
  selectedDate: Date | null;
  
  // Appointment actions
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  // Press-on actions
  addPressOn: (pressOn: PressOn) => void;
  updatePressOn: (id: string, updates: Partial<PressOn>) => void;
  deletePressOn: (id: string) => void;
  
  // Date selection
  setSelectedDate: (date: Date | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      appointments: [],
      pressOns: [],
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
      }),
    }
  )
);

