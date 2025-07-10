import { z } from 'zod';

// Position validation schema (strict mode to prevent extra properties)
export const PositionSchema = z
  .object({
    row: z.number().int().min(0).max(2),
    col: z.number().int().min(0).max(2),
  })
  .strict(); // Reject extra properties

// Game ID validation schema (4 character alphanumeric, using same chars as generateGameId)
export const GameIdSchema = z
  .string()
  .length(4)
  .regex(
    /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/,
    'Game ID must contain only valid characters (A-Z except I,O and 2-9 except 0,1)'
  );

// Bot difficulty validation schema
export const BotDifficultySchema = z.enum([
  'random',
  'easy',
  'medium',
  'hard',
] as const);

// Player validation schema
export const PlayerSchema = z.enum(['X', 'O'] as const);

// Bot game creation schema
export const CreateBotGameSchema = z
  .object({
    botDifficulty: BotDifficultySchema.optional(),
    humanPlayer: PlayerSchema.optional(),
  })
  .strict(); // Reject extra properties

// Socket event validation schemas
export const SocketEventSchemas = {
  // No payload needed for create-game
  'create-game': z.void(),

  // Join game requires valid game ID
  'join-game': GameIdSchema,

  // Make move requires valid position
  'make-move': PositionSchema,

  // No payload needed for leave-game
  'leave-game': z.void(),

  // Matchmaking events - no payload needed
  'join-queue': z.void(),
  'leave-queue': z.void(),

  // Bot game creation
  'create-bot-game': CreateBotGameSchema,

  // No payload needed for ping
  ping: z.void(),
} as const;

// Type inference helpers
export type ValidatedPosition = z.infer<typeof PositionSchema>;
export type ValidatedGameId = z.infer<typeof GameIdSchema>;
export type ValidatedBotDifficulty = z.infer<typeof BotDifficultySchema>;
export type ValidatedPlayer = z.infer<typeof PlayerSchema>;
export type ValidatedCreateBotGame = z.infer<typeof CreateBotGameSchema>;

// Validation result type
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Generic validation function
export function validateSocketEvent<T extends keyof typeof SocketEventSchemas>(
  eventName: T,
  data: unknown
): ValidationResult<z.infer<(typeof SocketEventSchemas)[T]>> {
  try {
    const schema = SocketEventSchemas[eventName];
    const validatedData = schema.parse(data);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
      };
    }

    return {
      success: false,
      error: 'Unknown validation error',
    };
  }
}

// Rate limiting schemas for additional security
export const RateLimitSchema = z.object({
  windowMs: z.number().positive(),
  maxRequests: z.number().positive(),
});

// Additional validation utilities
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove HTML/script injection chars
    .slice(0, 100); // Limit length
}

export function isValidSocketId(socketId: unknown): socketId is string {
  return (
    typeof socketId === 'string' &&
    socketId.length > 0 &&
    socketId.length <= 50 && // Reasonable length limit
    /^[a-zA-Z0-9_-]+$/.test(socketId)
  ); // Alphanumeric + safe chars only
}
