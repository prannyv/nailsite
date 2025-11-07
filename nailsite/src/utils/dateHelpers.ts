import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  isToday,
  addWeeks,
  format,
  parseISO
} from 'date-fns';
import type { Appointment } from '../types/appointment';

// Get all days in a month for calendar grid (including padding days)
export const getDaysInMonth = (date: Date): Date[] => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
};

// Check if date has appointments
export const hasAppointments = (date: Date, appointments: Appointment[]): boolean => {
  return appointments.some(apt => isSameDay(new Date(apt.date), date));
};

// Get appointments for a specific date
export const getAppointmentsForDate = (date: Date, appointments: Appointment[]): Appointment[] => {
  return appointments.filter(apt => isSameDay(new Date(apt.date), date));
};

// Get appointments for next 7 days
export const getUpcomingWeekAppointments = (appointments: Appointment[]): Appointment[] => {
  const today = new Date();
  const nextWeek = addWeeks(today, 1);
  
  return appointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && aptDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy');
};

// Format date and time for display
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
};

// Check if date is today
export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

// Get appointment count for a date
export const getAppointmentCount = (date: Date, appointments: Appointment[]): number => {
  return getAppointmentsForDate(date, appointments).length;
};

