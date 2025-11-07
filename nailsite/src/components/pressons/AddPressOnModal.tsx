import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { useStore } from '../../store/useStore';
import { PRESS_ON_STATUSES } from '../../utils/constants';
import type { PressOn } from '../../types/presson';

interface AddPressOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPressOn?: PressOn | null;
}

export const AddPressOnModal: React.FC<AddPressOnModalProps> = ({
  isOpen,
  onClose,
  editingPressOn,
}) => {
  const addPressOn = useStore((state) => state.addPressOn);
  const updatePressOn = useStore((state) => state.updatePressOn);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    quantity: 1,
    status: 'AVAILABLE' as PressOn['status'],
  });
  
  const [photos, setPhotos] = useState<string[]>([]);
  
  useEffect(() => {
    if (editingPressOn) {
      setFormData({
        name: editingPressOn.name,
        description: editingPressOn.description || '',
        size: editingPressOn.size,
        quantity: editingPressOn.quantity,
        status: editingPressOn.status,
      });
      setPhotos(editingPressOn.photos);
    }
  }, [editingPressOn, isOpen]);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pressOnData = {
      name: formData.name,
      description: formData.description || undefined,
      photos,
      size: formData.size,
      quantity: formData.quantity,
      status: formData.status,
    };
    
    if (editingPressOn) {
      updatePressOn(editingPressOn.id, {
        ...pressOnData,
        updatedAt: new Date(),
      });
    } else {
      const newPressOn: PressOn = {
        id: crypto.randomUUID(),
        ...pressOnData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addPressOn(newPressOn);
    }
    
    handleClose();
  };
  
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      size: '',
      quantity: 1,
      status: 'AVAILABLE',
    });
    setPhotos([]);
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingPressOn ? 'Edit Press-On' : 'New Press-On'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border-2 border-silver-light rounded-lg focus:border-pink-hot focus:outline-none"
            placeholder="e.g., Pink Glitter Set"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border-2 border-silver-light rounded-lg focus:border-pink-hot focus:outline-none"
            rows={3}
            placeholder="Add details about this press-on set..."
          />
        </div>
        
        {/* Size and Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size *
            </label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-2 border-2 border-silver-light rounded-lg focus:border-pink-hot focus:outline-none"
              placeholder="e.g., S, M, L"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border-2 border-silver-light rounded-lg focus:border-pink-hot focus:outline-none"
              required
            />
          </div>
        </div>
        
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PRESS_ON_STATUSES.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setFormData({ ...formData, status: status.value as PressOn['status'] })}
                className={`
                  px-4 py-3 rounded-lg font-medium transition-colors text-sm
                  ${formData.status === status.value
                    ? 'bg-pink-hot text-white'
                    : 'bg-silver-light text-gray-700 hover:bg-silver'
                  }
                `}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-silver rounded-lg cursor-pointer hover:border-pink-hot transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600">Upload Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            {editingPressOn ? 'Update Press-On' : 'Add Press-On'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

