import { validateParticipants, cleanParticipant, formatPhoneNumber, generateParticipantSummary } from '../src/lib/participantUtils';
import { Participant } from '../src/lib/csvParser';

describe('Participant Utils', () => {
  describe('validateParticipants', () => {
    test('should validate minimum participants', () => {
      const participants: Participant[] = [
        { id: 1, name: 'أحمد محمد' }
      ];

      const result = validateParticipants(participants);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('يجب أن يكون هناك مشاركان على الأقل للسحب');
    });

    test('should detect empty names', () => {
      const participants: Participant[] = [
        { id: 1, name: 'أحمد محمد' },
        { id: 2, name: '' },
        { id: 3, name: 'فاطمة علي' }
      ];

      const result = validateParticipants(participants);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('مشارك بدون اسم'))).toBe(true);
    });

    test('should detect duplicate names', () => {
      const participants: Participant[] = [
        { id: 1, name: 'أحمد محمد' },
        { id: 2, name: 'أحمد محمد' },
        { id: 3, name: 'فاطمة علي' }
      ];

      const result = validateParticipants(participants);

      expect(result.warnings.some(w => w.includes('أسماء مكررة'))).toBe(true);
    });

    test('should validate phone numbers', () => {
      const participants: Participant[] = [
        { id: 1, name: 'أحمد محمد', phone: '0501234567' },
        { id: 2, name: 'فاطمة علي', phone: '123456' }, // Invalid
        { id: 3, name: 'محمد سالم' }
      ];

      const result = validateParticipants(participants);

      expect(result.warnings.some(w => w.includes('رقم هاتف غير صحيح'))).toBe(true);
    });

    test('should validate email addresses', () => {
      const participants: Participant[] = [
        { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com' },
        { id: 2, name: 'فاطمة علي', email: 'invalid-email' }, // Invalid
        { id: 3, name: 'محمد سالم' }
      ];

      const result = validateParticipants(participants);

      expect(result.warnings.some(w => w.includes('بريد إلكتروني غير صحيح'))).toBe(true);
    });
  });

  describe('cleanParticipant', () => {
    test('should clean valid participant', () => {
      const input = {
        id: 1,
        name: '  أحمد محمد  ',
        phone: '  0501234567  ',
        email: '  ahmed@example.com  '
      };

      const result = cleanParticipant(input);

      expect(result).toEqual({
        id: 1,
        name: 'أحمد محمد',
        phone: '0501234567',
        email: 'ahmed@example.com'
      });
    });

    test('should return null for empty name', () => {
      const input = {
        id: 1,
        name: '  ',
        phone: '0501234567'
      };

      const result = cleanParticipant(input);

      expect(result).toBeNull();
    });

    test('should return null for short name', () => {
      const input = {
        id: 1,
        name: 'أ',
        phone: '0501234567'
      };

      const result = cleanParticipant(input);

      expect(result).toBeNull();
    });
  });

  describe('formatPhoneNumber', () => {
    test('should format Saudi phone numbers with country code', () => {
      expect(formatPhoneNumber('966501234567')).toBe('501234567');
    });

    test('should handle numbers starting with 05', () => {
      expect(formatPhoneNumber('0501234567')).toBe('0501234567');
    });

    test('should add 0 prefix to 9-digit numbers starting with 5', () => {
      expect(formatPhoneNumber('501234567')).toBe('0501234567');
    });

    test('should remove non-digit characters', () => {
      expect(formatPhoneNumber('050-123-4567')).toBe('0501234567');
      expect(formatPhoneNumber('050 123 4567')).toBe('0501234567');
    });
  });

  describe('generateParticipantSummary', () => {
    test('should generate correct summary', () => {
      const participants: Participant[] = [
        { id: 1, name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@example.com' },
        { id: 2, name: 'فاطمة علي', phone: '0502345678' },
        { id: 3, name: 'محمد سالم', email: 'mohammed@example.com' },
        { id: 4, name: 'عائشة أحمد' }
      ];

      const summary = generateParticipantSummary(participants);

      expect(summary).toEqual({
        total: 4,
        withPhone: 2,
        withEmail: 2,
        validContacts: 3
      });
    });
  });
});