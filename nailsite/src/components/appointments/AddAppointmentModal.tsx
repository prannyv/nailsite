import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { DatePicker } from '../ui/date-picker';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAppointmentSync } from '../../hooks/useAppointmentSync';
import { calculateAppointmentPrice, createAddOn } from '../../utils/priceCalculator';
import { SERVICE_TYPES, NAIL_LENGTHS, ADD_ON_TYPES } from '../../utils/constants';
import type { Appointment, AddOn } from '../../types/appointment';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment?: Appointment | null;
  preSelectedDate?: Date | null;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  editingAppointment,
  preSelectedDate,
}) => {
  const { addAppointment, updateAppointment } = useAppointmentSync();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [formData, setFormData] = useState({
    clientName: '',
    serviceType: 'GEL_X' as Appointment['serviceType'],
    nailLength: 'SHORT_MEDIUM' as Appointment['nailLength'],
    inspirationText: '',
  });
  
  const [selectedAddOns, setSelectedAddOns] = useState<Map<string, number>>(new Map());
  const [inspirationPhotos, setInspirationPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    if (editingAppointment) {
      const aptDate = new Date(editingAppointment.date);
      setSelectedDate(aptDate);
      setSelectedTime(aptDate.toTimeString().slice(0, 5)); // HH:MM format
      
      setFormData({
        clientName: editingAppointment.clientName || '',
        serviceType: editingAppointment.serviceType,
        nailLength: editingAppointment.nailLength,
        inspirationText: editingAppointment.inspirationText,
      });
      
      const addOnsMap = new Map<string, number>();
      editingAppointment.addOns.forEach(addOn => {
        addOnsMap.set(addOn.type, addOn.quantity);
      });
      setSelectedAddOns(addOnsMap);
      setInspirationPhotos(editingAppointment.inspirationPhotos);
    } else if (preSelectedDate) {
      setSelectedDate(preSelectedDate);
      setSelectedTime('12:00');
    } else {
      // Default to today
      setSelectedDate(new Date());
      setSelectedTime('12:00');
    }
  }, [editingAppointment, preSelectedDate, isOpen]);
  
  const handleAddOnToggle = (type: AddOn['type'], quantity: number) => {
    setSelectedAddOns(prev => {
      const newMap = new Map(prev);
      if (quantity === 0) {
        newMap.delete(type);
      } else {
        newMap.set(type, quantity);
      }
      return newMap;
    });
  };
  
  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setInspirationPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(files);
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    setInspirationPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const calculateEstimatedPrice = (): number => {
    const addOns: AddOn[] = Array.from(selectedAddOns.entries()).map(([type, quantity]) =>
      createAddOn(type as AddOn['type'], quantity)
    );
    
    return calculateAppointmentPrice({
      serviceType: formData.serviceType,
      nailLength: formData.nailLength,
      addOns,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) return;
    
    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));
    
    const addOns: AddOn[] = Array.from(selectedAddOns.entries()).map(([type, quantity]) =>
      createAddOn(type as AddOn['type'], quantity)
    );
    
    const estimatedPrice = calculateEstimatedPrice();
    
    const appointmentData = {
      date: appointmentDate,
      clientName: formData.clientName || undefined,
      serviceType: formData.serviceType,
      nailLength: formData.nailLength,
      addOns,
      inspirationPhotos,
      inspirationText: formData.inspirationText,
      estimatedPrice,
      status: 'SCHEDULED' as const,
    };
    
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, {
        ...appointmentData,
        updatedAt: new Date(),
      });
    } else {
      const newAppointment: Appointment = {
        id: crypto.randomUUID(),
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addAppointment(newAppointment);
    }
    
    handleClose();
  };
  
  const handleClose = () => {
    setSelectedDate(new Date());
    setSelectedTime('12:00');
    setFormData({
      clientName: '',
      serviceType: 'GEL_X',
      nailLength: 'SHORT_MEDIUM',
      inspirationText: '',
    });
    setSelectedAddOns(new Map());
    setInspirationPhotos([]);
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Date *</Label>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="Select date"
            />
          </div>
          <div>
            <Label className="mb-2 block">Time *</Label>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Name (Optional)
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="w-full px-4 py-2 border-2 border-silver-light rounded-lg focus:border-pink-hot focus:outline-none"
            placeholder="Enter client name"
          />
        </div>
        
        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SERVICE_TYPES.map((service) => (
              <button
                key={service.value}
                type="button"
                onClick={() => setFormData({ ...formData, serviceType: service.value as Appointment['serviceType'] })}
                className={`
                  px-4 py-3 rounded-lg font-medium transition-colors
                  ${formData.serviceType === service.value
                    ? 'bg-pink-hot text-white'
                    : 'bg-silver-light text-gray-700 hover:bg-silver'
                  }
                `}
              >
                {service.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Nail Length (only for Gel X) */}
        {formData.serviceType === 'GEL_X' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nail Length *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {NAIL_LENGTHS.map((length) => (
                <button
                  key={length.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, nailLength: length.value as Appointment['nailLength'] })}
                  className={`
                    px-4 py-3 rounded-lg font-medium transition-colors
                    ${formData.nailLength === length.value
                      ? 'bg-pink-hot text-white'
                      : 'bg-silver-light text-gray-700 hover:bg-silver'
                    }
                  `}
                >
                  {length.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Add-ons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Add-ons (Optional)
          </label>
          <div className="space-y-3">
            {ADD_ON_TYPES.map((addOn) => {
              const quantity = selectedAddOns.get(addOn.value) || 0;
              const isSelected = quantity > 0;
              
              return (
                <button
                  key={addOn.value}
                  type="button"
                  onClick={() => handleAddOnToggle(addOn.value as AddOn['type'], isSelected ? 0 : 10)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-lg font-medium transition-colors text-left
                    ${isSelected
                      ? 'bg-pink-hot text-white'
                      : 'bg-silver-light text-gray-700 hover:bg-silver'
                    }
                  `}
                >
                  <span>{addOn.label}</span>
                  {isSelected && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => handleAddOnToggle(addOn.value as AddOn['type'], parseInt(e.target.value) || 10)}
                        className="w-16 px-2 py-1 border border-white/20 bg-white/10 text-white rounded text-center focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <span className="text-sm text-white/90">nails</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Inspiration Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspiration Photos
          </label>
          <div className="space-y-3">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                relative flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all
                ${isDragging 
                  ? 'border-pink-hot bg-pink-baby/30 scale-[1.02]' 
                  : 'border-silver hover:border-pink-hot'
                }
              `}
            >
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full">
                <Upload size={24} className={isDragging ? "text-pink-hot" : "text-gray-400"} />
                <span className={`text-sm font-medium ${isDragging ? "text-pink-hot" : "text-gray-600"}`}>
                  {isDragging ? "Drop photos here" : "Click to upload or drag & drop"}
                </span>
                <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            {inspirationPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {inspirationPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Inspiration ${index + 1}`}
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
        
        {/* Inspiration Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspiration Notes
          </label>
          <textarea
            value={formData.inspirationText}
            onChange={(e) => setFormData({ ...formData, inspirationText: e.target.value })}
            className="w-full px-4 py-2 border-2 border-silver-light rounded-lg focus:border-pink-hot focus:outline-none"
            rows={3}
            placeholder="Add any notes or inspiration details..."
          />
        </div>
        
        {/* Estimated Price */}
        <div className="bg-pink-baby p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-800">Estimated Price:</span>
            <span className="text-2xl font-bold text-pink-hot">${calculateEstimatedPrice()}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

