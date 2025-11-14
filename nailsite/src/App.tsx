import { useState } from 'react';
import { Calendar } from './components/calendar/Calendar';
import { AppointmentList } from './components/appointments/AppointmentList';
import { PressOnList } from './components/pressons/PressOnList';
import { AddAppointmentModal } from './components/appointments/AddAppointmentModal';
import { AddPressOnModal } from './components/pressons/AddPressOnModal';
import { AddAvailabilityModal } from './components/availabilities/AddAvailabilityModal';
import { AddNewMenu } from './components/shared/AddNewMenu';
import { GoogleCalendarConnect } from './components/shared/GoogleCalendarConnect';
import { useStore } from './store/useStore';
import type { Appointment } from './types/appointment';
import type { PressOn } from './types/presson';
import type { Availability } from './types/availability';

function App() {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isPressOnModalOpen, setIsPressOnModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingPressOn, setEditingPressOn] = useState<PressOn | null>(null);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [preSelectedTime, setPreSelectedTime] = useState<string | null>(null);
  const [availabilityToRemove, setAvailabilityToRemove] = useState<string | null>(null); // Store availability ID to remove on appointment creation
  
  const selectedDate = useStore((state) => state.selectedDate);
  const setSelectedDate = useStore((state) => state.setSelectedDate);
  const appointments = useStore((state) => state.appointments);
  
  // Calculate total revenue (exclude cancelled appointments)
  const totalRevenue = appointments
    .filter(apt => apt.status !== 'CANCELLED')
    .reduce((sum, apt) => sum + apt.estimatedPrice, 0);
  
  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setPreSelectedTime(null);
    setAvailabilityToRemove(null);
    setIsAppointmentModalOpen(true);
  };
  
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };
  
  const handleAddPressOn = () => {
    setEditingPressOn(null);
    setIsPressOnModalOpen(true);
  };
  
  const handleEditPressOn = (pressOn: PressOn) => {
    setEditingPressOn(pressOn);
    setIsPressOnModalOpen(true);
  };
  
  const handleAddAvailability = () => {
    setEditingAvailability(null);
    setIsAvailabilityModalOpen(true);
  };
  
  const handleEditAvailability = (availability: Availability) => {
    setEditingAvailability(availability);
    setIsAvailabilityModalOpen(true);
  };
  
  const handleAvailabilityClick = (availability: Availability) => {
    // Convert availability to appointment modal pre-fill
    setSelectedDate(new Date(availability.date));
    setEditingAppointment(null);
    setPreSelectedTime(availability.startTime);
    setAvailabilityToRemove(availability.id); // Track which availability to remove on successful appointment creation
    setIsAppointmentModalOpen(true);
  };
  
  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
    setPreSelectedTime(null);
    setAvailabilityToRemove(null); // Clear the availability to remove since modal was closed
  };
  
  const handleClosePressOnModal = () => {
    setIsPressOnModalOpen(false);
    setEditingPressOn(null);
  };
  
  const handleCloseAvailabilityModal = () => {
    setIsAvailabilityModalOpen(false);
    setEditingAvailability(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-hot to-pink-light shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">PolishedByLauren</h1>
              <p className="text-pink-baby text-lg font-bold mt-1">Nail Appointment Calendar</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <GoogleCalendarConnect />
              <div className="text-right">
                <p className="text-pink-baby text-lg font-bold">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Appointments & Press-ons */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <AppointmentList onEditAppointment={handleEditAppointment} />
            </div>
            
            <div className="bg-white rounded-2xl shadow-md p-6">
              <PressOnList onEditPressOn={handleEditPressOn} />
            </div>
          </div>
          
          {/* Right Main Area - Calendar */}
          <div className="lg:col-span-8">
            <Calendar onAvailabilityClick={handleAvailabilityClick} />
          </div>
        </div>
      </main>
      
      {/* Floating Action Button */}
      <AddNewMenu
        onAddAppointment={handleAddAppointment}
        onAddPressOn={handleAddPressOn}
        onAddAvailability={handleAddAvailability}
      />
      
      {/* Modals */}
      <AddAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        editingAppointment={editingAppointment}
        preSelectedDate={selectedDate}
        preSelectedTime={preSelectedTime}
        availabilityIdToRemove={availabilityToRemove}
      />
      
      <AddPressOnModal
        isOpen={isPressOnModalOpen}
        onClose={handleClosePressOnModal}
        editingPressOn={editingPressOn}
      />
      
      <AddAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={handleCloseAvailabilityModal}
        editingAvailability={editingAvailability}
        preSelectedDate={selectedDate}
      />
    </div>
  );
}

export default App;
