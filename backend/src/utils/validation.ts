import Joi from 'joi';
import { CreateUserRequest, LoginRequest, CreateAppointmentRequest } from '../types';

// User validation schemas
export const createUserSchema = Joi.object<CreateUserRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(2).max(100).required(),
  user_type: Joi.string().valid('consultant', 'client').required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
});

export const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Appointment validation schemas
export const createAppointmentSchema = Joi.object<CreateAppointmentRequest>({
  consultant_id: Joi.number().integer().positive().required(),
  start_time: Joi.string().isoDate().required(),
  end_time: Joi.string().isoDate().required(),
  notes: Joi.string().max(500).optional(),
});

// Service validation schemas
export const createServiceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  duration: Joi.number().integer().min(15).max(480).required(), // 15 min to 8 hours
  price: Joi.number().positive().required(),
});

// Availability validation schemas
export const createAvailabilitySchema = Joi.object({
  day_of_week: Joi.number().integer().min(0).max(6).required(),
  start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  is_available: Joi.boolean().default(true),
});

// Generic validation function
export const validate = <T>(schema: Joi.ObjectSchema, data: any): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new Error(errorMessage);
  }
  
  return value;
};

// Date validation helpers
export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isFutureDate = (date: string): boolean => {
  return new Date(date) > new Date();
};

export const isValidTimeSlot = (startTime: string, endTime: string): boolean => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return start < end;
}; 