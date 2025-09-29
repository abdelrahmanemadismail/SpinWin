import { Participant } from './csvParser';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateParticipants(participants: Participant[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check minimum participants
  if (participants.length < 2) {
    result.isValid = false;
    result.errors.push('يجب أن يكون هناك مشاركان على الأقل للسحب');
  }

  // Check for empty names
  const emptyNames = participants.filter(p => !p.name || p.name.trim().length === 0);
  if (emptyNames.length > 0) {
    result.isValid = false;
    result.errors.push(`يوجد ${emptyNames.length} مشارك بدون اسم`);
  }

  // Check for duplicate names
  const nameMap = new Map<string, number>();
  participants.forEach(p => {
    const name = p.name.trim().toLowerCase();
    nameMap.set(name, (nameMap.get(name) || 0) + 1);
  });

  const duplicates = Array.from(nameMap.entries()).filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    result.warnings.push(`يوجد أسماء مكررة: ${duplicates.map(([name]) => name).join(', ')}`);
  }

  // Check for invalid phone numbers
  const invalidPhones = participants.filter(p =>
    p.phone && !/^(05|5)\d{8}$/.test(p.phone.replace(/\s+/g, ''))
  );
  if (invalidPhones.length > 0) {
    result.warnings.push(`يوجد ${invalidPhones.length} رقم هاتف غير صحيح`);
  }

  // Check for invalid emails
  const invalidEmails = participants.filter(p =>
    p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)
  );
  if (invalidEmails.length > 0) {
    result.warnings.push(`يوجد ${invalidEmails.length} بريد إلكتروني غير صحيح`);
  }

  return result;
}

export function cleanParticipant(participant: Partial<Participant>): Participant | null {
  const name = participant.name?.trim();
  if (!name || name.length < 2) {
    return null;
  }

  return {
    id: participant.id || 0,
    name,
    phone: participant.phone?.trim() || undefined,
    email: participant.email?.trim() || undefined
  };
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle Saudi phone numbers
  if (digits.startsWith('966')) {
    return digits.slice(3);
  } else if (digits.startsWith('05')) {
    return digits;
  } else if (digits.startsWith('5') && digits.length === 9) {
    return '0' + digits;
  }

  return digits;
}

export function generateParticipantSummary(participants: Participant[]): {
  total: number;
  withPhone: number;
  withEmail: number;
  validContacts: number;
} {
  return {
    total: participants.length,
    withPhone: participants.filter(p => p.phone).length,
    withEmail: participants.filter(p => p.email).length,
    validContacts: participants.filter(p => p.phone || p.email).length
  };
}