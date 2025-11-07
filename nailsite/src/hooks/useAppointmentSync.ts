import { useStore } from '../store/useStore';
import { GoogleCalendarService } from '../lib/googleCalendar';
import type { Appointment } from '../types/appointment';

export const useAppointmentSync = () => {
  const addAppointment = useStore((state) => state.addAppointment);
  const updateAppointment = useStore((state) => state.updateAppointment);
  const deleteAppointment = useStore((state) => state.deleteAppointment);

  const addAppointmentWithSync = async (appointment: Appointment) => {
    // Add to local store first
    addAppointment(appointment);

    // Sync to Google Calendar if connected
    if (GoogleCalendarService.isAuthenticated()) {
      try {
        const eventId = await GoogleCalendarService.createEvent(appointment);
        // Update appointment with Google Calendar event ID
        updateAppointment(appointment.id, { googleCalendarEventId: eventId });
      } catch (error) {
        console.error('Failed to sync to Google Calendar:', error);
        // Continue - local appointment is still created
      }
    }
  };

  const updateAppointmentWithSync = async (id: string, updates: Partial<Appointment>) => {
    const appointments = useStore.getState().appointments;
    const appointment = appointments.find(apt => apt.id === id);

    // Update local store first
    updateAppointment(id, updates);

    // Sync to Google Calendar if connected and has event ID
    if (GoogleCalendarService.isAuthenticated() && appointment?.googleCalendarEventId) {
      try {
        const updatedAppointment = { ...appointment, ...updates };
        await GoogleCalendarService.updateEvent(
          appointment.googleCalendarEventId,
          updatedAppointment as Appointment
        );
      } catch (error) {
        console.error('Failed to sync update to Google Calendar:', error);
      }
    }
  };

  const deleteAppointmentWithSync = async (id: string) => {
    const appointments = useStore.getState().appointments;
    const appointment = appointments.find(apt => apt.id === id);

    // Delete from local store first
    deleteAppointment(id);

    // Sync deletion to Google Calendar if connected and has event ID
    if (GoogleCalendarService.isAuthenticated() && appointment?.googleCalendarEventId) {
      try {
        await GoogleCalendarService.deleteEvent(appointment.googleCalendarEventId);
      } catch (error) {
        console.error('Failed to delete from Google Calendar:', error);
      }
    }
  };

  return {
    addAppointment: addAppointmentWithSync,
    updateAppointment: updateAppointmentWithSync,
    deleteAppointment: deleteAppointmentWithSync,
  };
};

