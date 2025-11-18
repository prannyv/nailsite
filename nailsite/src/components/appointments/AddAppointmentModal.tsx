import { useState, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { DatePicker } from '../ui/date-picker';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAppointmentSync } from '../../hooks/useAppointmentSync';
import { SERVICE_TYPES, NAIL_LENGTHS } from '../../utils/constants';
import { useStore } from '../../store/useStore';
import type { Appointment } from '../../types/appointment';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment?: Appointment | null;
  preSelectedDate?: Date | null;
  preSelectedTime?: string | null;
  availabilityIdToRemove?: string | null;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  editingAppointment,
  preSelectedDate,
  preSelectedTime,
  availabilityIdToRemove,
}) => {
  const { addAppointment, updateAppointment } = useAppointmentSync();
  const deleteAvailability = useStore((state) => state.deleteAvailability);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [basePriceInput, setBasePriceInput] = useState<string>('60');
  const [soakOff, setSoakOff] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    serviceType: 'GEL_X' as Appointment['serviceType'],
    nailLength: 'SHORT_MEDIUM' as Appointment['nailLength'],
    inspirationText: '',
    price: 60,
  });
  
  const [inspirationPhotos, setInspirationPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate price based on base price and soak off
  useEffect(() => {
    const basePrice = parseFloat(basePriceInput) || 0;
    const calculatedPrice = basePrice + (soakOff ? 10 : 0);
    setFormData(prev => ({ ...prev, price: calculatedPrice }));
  }, [basePriceInput, soakOff]);
  
  useEffect(() => {
    if (editingAppointment) {
      const aptDate = new Date(editingAppointment.date);
      setSelectedDate(aptDate);
      setSelectedTime(aptDate.toTimeString().slice(0, 5)); // HH:MM format
      
      const editingSoakOff = editingAppointment.soakOff ?? false;
      const editingBasePrice = editingAppointment.price - (editingSoakOff ? 10 : 0);
      
      setSoakOff(editingSoakOff);
      setBasePriceInput(editingBasePrice.toString());
      setFormData({
        clientName: editingAppointment.clientName || '',
        serviceType: editingAppointment.serviceType,
        nailLength: editingAppointment.nailLength,
        inspirationText: editingAppointment.inspirationText,
        price: editingAppointment.price,
      });
      
      setInspirationPhotos(editingAppointment.inspirationPhotos);
    } else if (preSelectedDate) {
      setSelectedDate(preSelectedDate);
      setSelectedTime(preSelectedTime || '12:00');
      setBasePriceInput('60');
      setSoakOff(false);
    } else {
      // Default to today
      setSelectedDate(new Date());
      setSelectedTime('12:00');
      setBasePriceInput('60');
      setSoakOff(false);
    }
  }, [editingAppointment, preSelectedDate, preSelectedTime, isOpen]);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) return;
    
    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));
    
    // Calculate final price - if basePriceInput is empty, default to 0
    const basePrice = parseFloat(basePriceInput) || 0;
    const finalPrice = basePrice + (soakOff ? 10 : 0);
    
    const appointmentData = {
      date: appointmentDate,
      clientName: formData.clientName || undefined,
      serviceType: formData.serviceType,
      nailLength: formData.nailLength,
      soakOff,
      inspirationPhotos,
      inspirationText: formData.inspirationText,
      price: finalPrice,
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
      
      // If this appointment was created from an availability, remove that availability
      if (availabilityIdToRemove) {
        deleteAvailability(availabilityIdToRemove);
      }
    }
    
    handleClose();
  };
  
  const handleClose = () => {
    setSelectedDate(new Date());
    setSelectedTime('12:00');
    setBasePriceInput('60');
    setSoakOff(false);
    setFormData({
      clientName: '',
      serviceType: 'GEL_X',
      nailLength: 'SHORT_MEDIUM',
      inspirationText: '',
      price: 60,
    });
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
        
        {/* Soak Off Service */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={soakOff}
                onChange={(e) => setSoakOff(e.target.checked)}
                className="w-5 h-5 rounded border-2 cursor-pointer appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-pink-hot focus:ring-offset-2"
                style={{
                  backgroundColor: soakOff ? '#ec4899' : 'white',
                  borderColor: soakOff ? '#ec4899' : '#d1d5db',
                }}
              />
              {soakOff && (
                <Check 
                  size={16} 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none"
                  strokeWidth={3}
                />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              Soak Off (+$10)
            </span>
          </label>
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
        
        {/* Price Editor */}
        <div className="bg-pink-baby p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-800">Price:</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={basePriceInput}
              onChange={(e) => setBasePriceInput(e.target.value)}
              className="bg-transparent border-none outline-none text-2xl font-bold text-pink-hot text-right w-32 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="60.00"
            />
          </div>
          {soakOff && (
            <div className="mt-2 text-sm text-gray-600">
              Base: ${(parseFloat(basePriceInput) || 0).toFixed(2)} + Soak Off: $10.00 = <span className="font-semibold">${formData.price.toFixed(2)}</span>
            </div>
          )}
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

