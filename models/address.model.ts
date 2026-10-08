// Mirrors user-service AddressResponse and AddressRequest
export interface Address {
  id: number;
  customerProfileId: number;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  accessInstructions?: string;
  parkingShadeNotes?: string;
  serviceable: boolean;
  isDefault: boolean;
}

export interface AddressRequest {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  accessInstructions?: string;
  parkingShadeNotes?: string;
  serviceable: boolean;
  isDefault: boolean;
}
