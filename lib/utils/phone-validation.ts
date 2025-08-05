// Bangladeshi phone number validation and normalization utilities

import { BangladeshiPhoneValidation, BANGLADESHI_OPERATORS } from '@/lib/types/user';

/**
 * Validates if a phone number is a valid Bangladeshi number
 * @param phone - The phone number to validate
 * @returns Validation result with normalized phone and operator info
 */
export function validateBangladeshiPhone(phone: string): BangladeshiPhoneValidation {
  if (!phone) {
    return {
      isValid: false,
      message: 'Phone number is required'
    };
  }

  // Remove any spaces, dashes, or plus signs
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');

  // Check if it's a valid Bangladeshi number format
  const validation = isValidBangladeshiFormat(cleanPhone);
  
  if (!validation.isValid) {
    return validation;
  }

  // Normalize the phone number
  const normalizedPhone = normalizeBangladeshiPhone(cleanPhone);
  
  // Get operator info
  const operator = getBangladeshiOperator(normalizedPhone);

  return {
    isValid: true,
    normalized_phone: normalizedPhone,
    operator: operator === 'Unknown' ? undefined : operator
  };
}

/**
 * Checks if the phone number follows valid Bangladeshi format patterns
 * @param phone - Clean phone number (no spaces, dashes, etc.)
 * @returns Validation result
 */
function isValidBangladeshiFormat(phone: string): BangladeshiPhoneValidation {
  // Pattern 1: +880XXXXXXXXX (13 digits with country code)
  if (/^880[1-9][0-9]{8}$/.test(phone)) {
    return { isValid: true };
  }

  // Pattern 2: 01XXXXXXXXX (11 digits local format)
  if (/^01[3-9][0-9]{8}$/.test(phone)) {
    return { isValid: true };
  }

  // Pattern 3: 1XXXXXXXXX (10 digits without leading 0)
  if (/^1[3-9][0-9]{8}$/.test(phone)) {
    return { isValid: true };
  }

  // Check for common invalid patterns
  if (phone.length < 10) {
    return {
      isValid: false,
      message: 'Phone number is too short. Bangladeshi numbers should have at least 10 digits.'
    };
  }

  if (phone.length > 13) {
    return {
      isValid: false,
      message: 'Phone number is too long. Please enter a valid Bangladeshi number.'
    };
  }

  if (/^01[0-2]/.test(phone)) {
    return {
      isValid: false,
      message: 'Invalid operator code. Bangladeshi mobile numbers start with 013, 014, 015, 016, 017, 018, or 019.'
    };
  }

  if (/^880[0-2]/.test(phone)) {
    return {
      isValid: false,
      message: 'Invalid operator code. Please enter a valid Bangladeshi mobile number.'
    };
  }

  return {
    isValid: false,
    message: 'Please enter a valid Bangladeshi phone number (e.g., 01712345678 or +8801712345678).'
  };
}

/**
 * Normalizes a Bangladeshi phone number to international format (880XXXXXXXXX)
 * @param phone - Clean phone number
 * @returns Normalized phone number
 */
export function normalizeBangladeshiPhone(phone: string): string {
  // Remove any spaces, dashes, or plus signs
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');

  // If it already starts with 880, return as is
  if (/^880[1-9][0-9]{8}$/.test(cleanPhone)) {
    return cleanPhone;
  }

  // If it starts with 01, convert to 880 format
  if (/^01[3-9][0-9]{8}$/.test(cleanPhone)) {
    return '880' + cleanPhone.substring(1);
  }

  // If it starts with 1 (without 0), convert to 8801 format
  if (/^1[3-9][0-9]{8}$/.test(cleanPhone)) {
    return '8801' + cleanPhone;
  }

  // Return original if no pattern matches
  return cleanPhone;
}

/**
 * Gets the operator name based on the phone number
 * @param phone - Normalized phone number (880XXXXXXXXX format)
 * @returns Operator name
 */
export function getBangladeshiOperator(phone: string): 'Grameenphone' | 'Robi' | 'Banglalink' | 'Teletalk' | 'Airtel' | 'Unknown' {
  // Extract the operator code (first 3 digits after 880)
  const operatorCode = phone.substring(3, 6);

  // Check each operator's prefixes
  for (const [operatorKey, operatorInfo] of Object.entries(BANGLADESHI_OPERATORS)) {
    if (operatorInfo.prefix.some(prefix => operatorCode.startsWith(prefix))) {
      return operatorInfo.name;
    }
  }

  return 'Unknown';
}

/**
 * Formats a phone number for display
 * @param phone - Phone number to format
 * @param format - Display format ('local' | 'international')
 * @returns Formatted phone number
 */
export function formatBangladeshiPhone(phone: string, format: 'local' | 'international' = 'local'): string {
  const normalized = normalizeBangladeshiPhone(phone);
  
  if (format === 'international') {
    // Format as +880 1XXX-XXXXXX
    return `+${normalized.substring(0, 3)} ${normalized.substring(3, 4)}${normalized.substring(4, 7)}-${normalized.substring(7)}`;
  } else {
    // Format as 01XXX-XXXXXX
    return `0${normalized.substring(3, 4)}${normalized.substring(4, 7)}-${normalized.substring(7)}`;
  }
}

/**
 * Validates phone number for registration form
 * @param phone - Phone number to validate
 * @returns Validation result with user-friendly message
 */
export function validatePhoneForRegistration(phone: string): { isValid: boolean; message?: string } {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      message: 'Phone number is required'
    };
  }

  const validation = validateBangladeshiPhone(phone.trim());
  
  if (!validation.isValid) {
    return {
      isValid: false,
      message: validation.message
    };
  }

  return { isValid: true };
}

/**
 * Checks if a phone number is already registered
 * This function should be called from the API route
 * @param phone - Phone number to check
 * @returns Promise with availability status
 */
export async function checkPhoneAvailability(phone: string): Promise<{ available: boolean; message?: string }> {
  try {
    const response = await fetch('/api/auth/check-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking phone availability:', error);
    return {
      available: false,
      message: 'Unable to verify phone number. Please try again.'
    };
  }
}

/**
 * Generates a verification code for phone verification
 * @returns 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validates verification code format
 * @param code - Verification code to validate
 * @returns Validation result
 */
export function validateVerificationCode(code: string): { isValid: boolean; message?: string } {
  if (!code || code.trim() === '') {
    return {
      isValid: false,
      message: 'Verification code is required'
    };
  }

  const cleanCode = code.trim();

  if (!/^[0-9]{6}$/.test(cleanCode)) {
    return {
      isValid: false,
      message: 'Verification code must be 6 digits'
    };
  }

  return { isValid: true };
}

/**
 * Masks a phone number for display (e.g., +880 17XX-XXX678)
 * @param phone - Phone number to mask
 * @returns Masked phone number
 */
export function maskPhoneNumber(phone: string): string {
  const normalized = normalizeBangladeshiPhone(phone);
  
  if (normalized.length >= 11) {
    const start = normalized.substring(0, 6);
    const end = normalized.substring(normalized.length - 3);
    const masked = 'X'.repeat(normalized.length - 9);
    
    return `+${start}${masked}${end}`;
  }
  
  return phone;
}