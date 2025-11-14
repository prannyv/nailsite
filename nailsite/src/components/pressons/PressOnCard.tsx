import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import type { PressOn } from '../../types/presson';

interface PressOnCardProps {
  pressOn: PressOn;
  onEdit: (pressOn: PressOn) => void;
  onDelete: (id: string) => void;
}

export const PressOnCard: React.FC<PressOnCardProps> = ({
  pressOn,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const statusColors = {
    AVAILABLE: 'bg-green-100 text-green-700',
    RESERVED: 'bg-yellow-100 text-yellow-700',
    SOLD: 'bg-gray-100 text-gray-700',
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Thumbnail and Info */}
      <div
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {pressOn.photos.length > 0 && (
          <img
            src={pressOn.photos[0]}
            alt={pressOn.name}
            className="w-full h-40 object-cover"
          />
        )}
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">{pressOn.name}</h4>
            <button className="text-gray-400 hover:text-pink-hot transition-colors">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[pressOn.status]}`}>
              {pressOn.status}
            </span>
            <span className="text-sm text-gray-600">Size: {pressOn.size}</span>
          </div>
          
          <p className="text-sm text-gray-600">Quantity: {pressOn.quantity}</p>
        </div>
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {pressOn.description && (
            <p className="text-sm text-gray-700 mt-3 mb-3">{pressOn.description}</p>
          )}
          
          {pressOn.photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {pressOn.photos.slice(1).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${pressOn.name} ${index + 2}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pressOn);
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
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(pressOn.id)}
        title="Delete Press-On?"
        message={`Are you sure you want to delete "${pressOn.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

