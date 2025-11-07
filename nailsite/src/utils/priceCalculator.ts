import { PRICING } from './constants';
import type { Appointment, AddOn } from '../types/appointment';

// Calculate total appointment price
export const calculateAppointmentPrice = (appointment: Partial<Appointment>): number => {
  let total = 0;
  
  // Base service price
  if (appointment.serviceType === 'GEL_X') {
    total += PRICING.GEL_X[appointment.nailLength || 'SHORT_MEDIUM'];
  } else if (appointment.serviceType === 'GEL_MANICURE') {
    total += PRICING.GEL_MANICURE;
  } else if (appointment.serviceType === 'BUILDER_GEL') {
    total += PRICING.BUILDER_GEL;
  }
  
  // Add-ons (multiply by quantity)
  appointment.addOns?.forEach(addOn => {
    total += addOn.totalPrice;
  });
  
  return total;
};

// Calculate add-on price
export const calculateAddOnPrice = (type: AddOn['type'], quantity: number): number => {
  const pricePerNail = PRICING.ADD_ONS[type];
  return pricePerNail * quantity;
};

// Create an add-on with calculated price
export const createAddOn = (type: AddOn['type'], quantity: number = 10): AddOn => {
  const pricePerNail = PRICING.ADD_ONS[type];
  const totalPrice = pricePerNail * quantity;
  
  return {
    type,
    quantity,
    pricePerNail,
    totalPrice,
  };
};

