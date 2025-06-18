import {
  GameIdSchema,
  isValidSocketId,
  PositionSchema,
  sanitizeString,
  validateSocketEvent,
} from '../schemas';

describe('Input Validation Schemas', () => {
  describe('PositionSchema', () => {
    test('accepts valid positions', () => {
      const validPositions = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
        { row: 0, col: 2 },
        { row: 2, col: 0 },
      ];

      for (const position of validPositions) {
        expect(() => PositionSchema.parse(position)).not.toThrow();
      }
    });

    test('rejects invalid positions', () => {
      const invalidPositions = [
        { row: -1, col: 0 }, // Negative row
        { row: 0, col: -1 }, // Negative col
        { row: 3, col: 0 }, // Row too high
        { row: 0, col: 3 }, // Col too high
        { row: 1.5, col: 0 }, // Non-integer row
        { row: 0, col: 1.5 }, // Non-integer col
        { row: '1', col: 0 }, // String instead of number
        { col: 0 }, // Missing row
        { row: 0 }, // Missing col
        null,
        undefined,
        'invalid',
      ];

      for (const position of invalidPositions) {
        expect(() => PositionSchema.parse(position)).toThrow();
      }
    });
  });

  describe('GameIdSchema', () => {
    test('accepts valid game IDs', () => {
      const validIds = ['A2B3', 'H7K9', 'Z2Z9', 'ABCD', '2345'];

      for (const id of validIds) {
        expect(() => GameIdSchema.parse(id)).not.toThrow();
      }
    });

    test('rejects invalid game IDs', () => {
      // Test null and undefined separately as they might be handled differently
      expect(() => GameIdSchema.parse(null)).toThrow();
      expect(() => GameIdSchema.parse(undefined)).toThrow();
      expect(() => GameIdSchema.parse(123)).toThrow();

      const stringInvalidIds = [
        'abc', // Too short
        'ABCDE', // Too long
        'A1B2', // Contains 1 (not in allowed set)
        'A0B2', // Contains 0 (not in allowed set)
        'AIBC', // Contains I (not in allowed set)
        'AOBC', // Contains O (not in allowed set)
        'ab12', // Lowercase
        'A B2', // Contains space
        'A!B2', // Contains special char
        '', // Empty
      ];

      for (const id of stringInvalidIds) {
        expect(() => GameIdSchema.parse(id)).toThrow();
      }
    });
  });

  describe('validateSocketEvent', () => {
    test('validates create-game event (void)', () => {
      const result = validateSocketEvent('create-game', undefined);
      expect(result.success).toBe(true);
    });

    test('rejects create-game event with data', () => {
      const result = validateSocketEvent('create-game', { malicious: 'data' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation failed');
      }
    });

    test('validates join-game event with valid game ID', () => {
      const result = validateSocketEvent('join-game', 'A2B3');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('A2B3');
      }
    });

    test('rejects join-game event with invalid game ID', () => {
      const result = validateSocketEvent('join-game', 'invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation failed');
      }
    });

    test('validates make-move event with valid position', () => {
      const position = { row: 1, col: 1 };
      const result = validateSocketEvent('make-move', position);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(position);
      }
    });

    test('rejects make-move event with invalid position', () => {
      const invalidPositions = [
        { row: -1, col: 0 },
        { row: 3, col: 0 },
        { row: 'invalid', col: 0 },
        null,
        undefined,
        'not-a-position',
      ];

      for (const position of invalidPositions) {
        const result = validateSocketEvent('make-move', position);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('Validation failed');
        }
      }
    });

    test('validates leave-game event (void)', () => {
      const result = validateSocketEvent('leave-game', undefined);
      expect(result.success).toBe(true);
    });

    test('validates ping event (void)', () => {
      const result = validateSocketEvent('ping', undefined);
      expect(result.success).toBe(true);
    });
  });

  describe('Security Utilities', () => {
    describe('sanitizeString', () => {
      test('removes dangerous characters', () => {
        const dangerous = '<script>alert("xss")</script>';
        const sanitized = sanitizeString(dangerous);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain("'");
        expect(sanitized).not.toContain('&');
      });

      test('trims whitespace', () => {
        const input = '  test string  ';
        const sanitized = sanitizeString(input);
        expect(sanitized).toBe('test string');
      });

      test('limits string length', () => {
        const longString = 'a'.repeat(200);
        const sanitized = sanitizeString(longString);
        expect(sanitized.length).toBeLessThanOrEqual(100);
      });

      test('throws error for non-string input', () => {
        expect(() => sanitizeString(123)).toThrow('Input must be a string');
        expect(() => sanitizeString(null)).toThrow('Input must be a string');
        expect(() => sanitizeString(undefined)).toThrow(
          'Input must be a string'
        );
        expect(() => sanitizeString({})).toThrow('Input must be a string');
      });
    });

    describe('isValidSocketId', () => {
      test('accepts valid socket IDs', () => {
        const validIds = [
          'abc123',
          'user_123',
          'user-456',
          'A1B2C3',
          'socket123456789',
        ];

        for (const id of validIds) {
          expect(isValidSocketId(id)).toBe(true);
        }
      });

      test('rejects invalid socket IDs', () => {
        const invalidIds = [
          '', // Empty
          'a'.repeat(51), // Too long
          'user@123', // Invalid character
          'user#123', // Invalid character
          'user 123', // Space
          'user!123', // Special character
          null,
          undefined,
          123, // Number
          {}, // Object
        ];

        for (const id of invalidIds) {
          expect(isValidSocketId(id)).toBe(false);
        }
      });
    });
  });

  describe('Malicious Input Protection', () => {
    test('prevents SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = validateSocketEvent('join-game', sqlInjection);
      expect(result.success).toBe(false);
    });

    test('prevents XSS attempts', () => {
      const xssAttempt = '<script>alert("xss")</script>';
      const result = validateSocketEvent('join-game', xssAttempt);
      expect(result.success).toBe(false);
    });

    test('prevents buffer overflow attempts', () => {
      const largeString = 'A'.repeat(10000);
      const result = validateSocketEvent('join-game', largeString);
      expect(result.success).toBe(false);
    });

    test('prevents null byte injection', () => {
      const nullByteAttempt = 'test\x00.exe';
      const result = validateSocketEvent('join-game', nullByteAttempt);
      expect(result.success).toBe(false);
    });

    test('prevents prototype pollution attempts', () => {
      const prototypePollution = { __proto__: { polluted: true } };
      const result = validateSocketEvent('make-move', prototypePollution);
      expect(result.success).toBe(false);
    });

    test('prevents JSON injection attempts', () => {
      const jsonInjection =
        '{"row": 1, "col": 1, "__proto__": {"polluted": true}}';
      const result = validateSocketEvent(
        'make-move',
        JSON.parse(jsonInjection)
      );
      expect(result.success).toBe(false); // Should fail due to extra properties
    });
  });
});
