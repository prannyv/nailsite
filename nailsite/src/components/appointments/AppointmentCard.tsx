import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { Appointment } from '../../types/appointment';
import { SERVICE_TYPES } from '../../utils/constants';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  forceExpanded?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  forceExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Use forceExpanded if provided, otherwise use local state
  const expanded = forceExpanded || isExpanded;
  
  const serviceLabel = SERVICE_TYPES.find(s => s.value === appointment.serviceType)?.label;
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      {/* Collapsed View */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800">
                {formatDateTime(appointment.date)}
              </span>
              <span className="bg-pink-baby text-pink-hot text-xs font-medium px-2 py-1 rounded-full">
                {serviceLabel}
              </span>
            </div>
            {appointment.clientName && (
              <p className="text-sm text-gray-600">{appointment.clientName}</p>
            )}
            <p className="text-lg font-semibold text-pink-hot mt-1">
              ${appointment.price}
            </p>
          </div>
          <button className="text-gray-400 hover:text-pink-hot transition-colors">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {/* Expanded View */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="space-y-3">
            {/* Nail Length */}
            {appointment.serviceType === 'GEL_X' && (
              <div>
                <span className="text-sm font-medium text-gray-600">Nail Length: </span>
                <span className="text-sm text-gray-800">
                  {appointment.nailLength.replace('_', '/')}
                </span>
              </div>
            )}
            
            {/* Soak Off */}
            {appointment.soakOff && (
              <div>
                <span className="text-sm font-medium text-gray-600">Soak Off: </span>
                <span className="text-sm text-gray-800">Yes (+$10)</span>
              </div>
            )}
            
            {/* Inspiration Text */}
            {appointment.inspirationText && (
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-1">Inspiration:</span>
                <p className="text-sm text-gray-800">{appointment.inspirationText}</p>
              </div>
            )}
            
            {/* Inspiration Photos */}
            {appointment.inspirationPhotos.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Photos:</span>
                <div className="grid grid-cols-3 gap-2">
                  {appointment.inspirationPhotos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Inspiration ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(appointment);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-silver-light hover:bg-silver text-gray-700 rounded-full text-sm font-medium transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-sm font-medium transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(appointment.id)}
        title="Delete Appointment?"
        message={`Are you sure you want to delete the appointment${appointment.clientName ? ` for ${appointment.clientName}` : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

