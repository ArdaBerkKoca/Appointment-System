export interface ValidationError {
  field: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  user_type: 'client' | 'consultant';
  expertise?: string;
  hourly_rate?: string | number;
}

export const validateLoginForm = (data: LoginFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: 'email', message: 'E-posta adresi gereklidir' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Geçerli bir e-posta adresi giriniz' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Şifre gereklidir' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Şifre en az 6 karakter olmalıdır' });
  }

  return errors;
};

export const validateRegisterForm = (data: RegisterFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.full_name) {
    errors.push({ field: 'full_name', message: 'Ad soyad gereklidir' });
  } else if (data.full_name.length < 2) {
    errors.push({ field: 'full_name', message: 'Ad soyad en az 2 karakter olmalıdır' });
  }

  if (!data.email) {
    errors.push({ field: 'email', message: 'E-posta adresi gereklidir' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Geçerli bir e-posta adresi giriniz' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Şifre gereklidir' });
  } else if (data.password.length < 6) {
    errors.push({ field: 'password', message: 'Şifre en az 6 karakter olmalıdır' });
  }

  if (!data.user_type) {
    errors.push({ field: 'user_type', message: 'Kullanıcı tipi seçiniz' });
  }

  if (data.user_type === 'consultant') {
    if (!data.expertise || String(data.expertise).trim().length < 2) {
      errors.push({ field: 'expertise', message: 'Uzmanlık alanı gereklidir' });
    }
    const rate = Number(data.hourly_rate);
    if (!rate || isNaN(rate) || rate <= 0) {
      errors.push({ field: 'hourly_rate', message: 'Geçerli bir saatlik ücret giriniz' });
    }
  }

  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  return errors.find(error => error.field === field)?.message;
};
