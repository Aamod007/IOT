// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  stock: number;
  featured: boolean;
  specifications?: Record<string, string>;
  compatibleWith?: string[];
  rating?: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  updateTime: string;
  email: string;
}

// Custom IoT Project Types
export interface ProjectComponent {
  id: string;
  name: string;
  type: 'sensor' | 'microcontroller' | 'actuator' | 'display' | 'power' | 'misc';
  price: number;
  image: string;
  quantity: number;
}

export interface ProjectRequirements {
  title: string;
  objective: string;
  environment: 'indoor' | 'outdoor' | 'both';
  powerSource: 'battery' | 'usb' | 'wall' | 'solar' | 'other';
  sizeConstraints?: string;
  additionalRequirements?: string;
}

export interface CustomProject {
  id: string;
  userId: string;
  components: ProjectComponent[];
  requirements: ProjectRequirements;
  totalPrice: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  blueprint?: Blueprint;
  createdAt: string;
  updatedAt: string;
}

export interface Blueprint {
  schematic: string; // URL to schematic image
  bom: ProjectComponent[];
  firmwareSuggestions: string[];
  instructions: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  parentId?: string;
  subcategories?: Category[];
}