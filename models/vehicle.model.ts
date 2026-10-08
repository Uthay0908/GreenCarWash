// Mirrors vehicle-service VehicleType enum.
export type VehicleType = 'HATCHBACK' | 'SEDAN' | 'SUV' | 'MUV' | 'TRUCK' | 'MOTORCYCLE';

// Mirrors vehicle-service VehicleResponse.
export interface Vehicle {
  id: number;
  customerProfileId: number;
  make: string;
  model: string;
  color?: string;
  licensePlate: string;
  vehicleType: VehicleType;
  imageUrl?: string;
  notes?: string;
  active: boolean;
  createdAt?: string;
}

// Mirrors vehicle-service VehicleRequest.
export interface VehicleRequest {
  make: string;
  model: string;
  color?: string;
  licensePlate: string;
  vehicleType: VehicleType;
  imageUrl?: string;
  notes?: string;
}
