import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { Availability } from '../../types/availability';

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAvailability?: Availability | null;
  preSelectedDate?: Date | null;
}

export const AddAvailabilityModal: React.FC<AddAvailabilityModalProps> = ({
  isOpen,
  onClose,
  editingAvailability,
  preSelectedDate,
}) => {
  const addAvailability = useStore((state) => state.addAvailability);
  const updateAvailability = useStore((state) => state.updateAvailability);
  const deleteAvailability = useStore((state) => state.deleteAvailability);
  
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (editingAvailability) {
        setDate(format(new Date(editingAvailability.date), 'yyyy-MM-dd'));
        setStartTime(editingAvailability.startTime);
      } else if (preSelectedDate) {
        setDate(format(preSelectedDate, 'yyyy-MM-dd'));
        setStartTime('09:00');
      } else {
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setStartTime('09:00');
      }
    }
  }, [isOpen, editingAvailability, preSelectedDate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime) {
      alert('Please fill in all fields');
      return;
    }
    
    const selectedDate = new Date(date);
    
    if (editingAvailability) {
      updateAvailability(editingAvailability.id, {
        date: selectedDate,
        startTime,
      });
    } else {
      const newAvailability: Availability = {
        id: `avail-${Date.now()}`,
        date: selectedDate,
        startTime,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      addAvailability(newAvailability);
    }
    
    onClose();
  };
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    if (editingAvailability) {
      deleteAvailability(editingAvailability.id);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingAvailability ? 'Edit Availability' : 'Add Availability'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-hot focus:border-transparent"
              required
            />
          </div>
          
          {/* Time */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-hot focus:border-transparent"
              required
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {editingAvailability && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-pink-hot text-white rounded-lg font-semibold hover:bg-pink-light transition-colors"
            >
              {editingAvailability ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Availability?"
        message="Are you sure you want to delete this availability? This action cannot be undone."
      />
    </div>
  );
};

