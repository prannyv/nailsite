export interface PressOn {
  id: string;
  name: string;
  description?: string;
  photos: string[];  // URLs or base64
  size: string;  // e.g., "XS", "S", "M", "L"
  quantity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  createdAt: Date;
  updatedAt: Date;
}

