export interface Appointment {
  id: string;
  date: Date;
  clientName?: string;
  serviceType: 'GEL_X' | 'GEL_MANICURE' | 'BUILDER_GEL';
  nailLength: 'SHORT_MEDIUM' | 'LONG_XLONG';
  addOns: AddOn[];
  inspirationPhotos: string[];  // URLs or base64
  inspirationText: string;
  estimatedPrice: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AddOn {
  type: 'FRENCH_TIP' | 'SIMPLE_DESIGN' | 'COMPLEX_DESIGN' | '3D_GEL' | 'CHARMS';
  quantity: number;  // Number of nails (default 10)
  pricePerNail: number;
  totalPrice: number;
}

