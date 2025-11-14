import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Package, Clock } from 'lucide-react';

interface AddNewMenuProps {
  onAddAppointment: () => void;
  onAddPressOn: () => void;
  onAddAvailability: () => void;
}

export const AddNewMenu: React.FC<AddNewMenuProps> = ({
  onAddAppointment,
  onAddPressOn,
  onAddAvailability,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleAddAppointment = () => {
    onAddAppointment();
    setIsOpen(false);
  };
  
  const handleAddPressOn = () => {
    onAddPressOn();
    setIsOpen(false);
  };
  
  const handleAddAvailability = () => {
    onAddAvailability();
    setIsOpen(false);
  };
  
  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {/* Menu Options */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-lg py-2 w-56 animate-fadeIn">
          <button
            onClick={handleAddAppointment}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-pink-baby transition-colors text-left"
          >
            <Calendar className="text-pink-hot" size={20} />
            <span className="font-medium text-gray-800">New Appointment</span>
          </button>
          <button
            onClick={handleAddPressOn}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-pink-baby transition-colors text-left"
          >
            <Package className="text-pink-hot" size={20} />
            <span className="font-medium text-gray-800">New Press-On</span>
          </button>
          <button
            onClick={handleAddAvailability}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
          >
            <Clock className="text-blue-500" size={20} />
            <span className="font-medium text-gray-800">New Availability</span>
          </button>
        </div>
      )}
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 bg-pink-hot text-white rounded-full shadow-lg
          flex items-center justify-center
          hover:bg-pink-light transition-all
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
        aria-label="Add new"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

