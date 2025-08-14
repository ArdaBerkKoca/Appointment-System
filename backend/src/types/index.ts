// User Types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  user_type: 'consultant' | 'client';
  phone?: string;
  avatar_url?: string;
  is_verified?: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  user_type: 'consultant' | 'client';
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Service Types
export interface Service {
  id: number;
  consultant_id: number;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  is_active: boolean;
  created_at: Date;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  duration: number;
  price: number;
}

// Availability Types
export interface Availability {
  id: number;
  consultant_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  created_at: Date;
}

export interface CreateAvailabilityRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
}

// Appointment Types
export interface Appointment {
  id: number;
  consultant_id: number;
  client_id: number;
  start_time: Date;
  end_time: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  meeting_link?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAppointmentRequest {
  consultant_id: number;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  start_time?: string;
  end_time?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  meeting_link?: string;
}

// AI Types
export interface AppointmentSuggestion {
  suggestedTimes: Date[];
  confidence: number;
  reasoning: string;
  priceRecommendation?: number;
}

export interface ChatMessage {
  id: string;
  userId: number;
  message: string;
  isAI: boolean;
  timestamp: Date;
  context?: any;
}

export interface AIRequest {
  type: 'appointment_suggestion' | 'chatbot' | 'analytics';
  data: any;
}

// Payment Types
export interface Payment {
  id: number;
  appointment_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  stripe_payment_intent_id?: string;
  created_at: Date;
}

// Notification Types
export interface Notification {
  id: number;
  user_id: number;
  type: 'email' | 'sms' | 'push';
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request/Response Types
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Express middleware type compatibility
export type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Database Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
} 