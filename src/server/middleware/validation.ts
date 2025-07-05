import type { Socket } from 'socket.io';
import { SocketEventSchemas, validateSocketEvent } from '../validation/schemas';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  'create-game': { windowMs: 60000, maxRequests: 5 }, // 5 games per minute
  'join-game': { windowMs: 60000, maxRequests: 10 }, // 10 joins per minute
  'make-move': { windowMs: 1000, maxRequests: 2 }, // 2 moves per second
  'leave-game': { windowMs: 60000, maxRequests: 10 }, // 10 leaves per minute
  'join-queue': { windowMs: 60000, maxRequests: 10 }, // 10 queue joins per minute
  'leave-queue': { windowMs: 60000, maxRequests: 10 }, // 10 queue leaves per minute
  'create-bot-game': { windowMs: 60000, maxRequests: 5 }, // 5 bot games per minute
  ping: { windowMs: 10000, maxRequests: 10 }, // 10 pings per 10 seconds
} as const;

// Rate limiting check
function checkRateLimit(
  socketId: string,
  eventName: keyof typeof RATE_LIMITS
): boolean {
  const limit = RATE_LIMITS[eventName];
  const key = `${socketId}:${eventName}`;
  const now = Date.now();

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return true;
  }

  if (current.count >= limit.maxRequests) {
    return false; // Rate limit exceeded
  }

  current.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Validation helper function for events with data
export function withValidation<T extends keyof typeof SocketEventSchemas>(
  socket: Socket,
  eventName: T,
  handler: (data: (typeof SocketEventSchemas)[T]['_output']) => void
) {
  return (data: unknown) => {
    try {
      // Rate limiting check
      if (!checkRateLimit(socket.id, eventName as keyof typeof RATE_LIMITS)) {
        console.warn(
          `Rate limit exceeded for ${socket.id} on event ${String(eventName)}`
        );
        socket.emit('error', {
          message: 'Rate limit exceeded. Please slow down.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }

      // Input validation
      const validation = validateSocketEvent(eventName, data);

      if (!validation.success) {
        console.warn(
          `Validation failed for ${socket.id} on event ${String(eventName)}:`,
          validation.error
        );
        socket.emit('error', {
          message: `Invalid input: ${validation.error}`,
          code: 'VALIDATION_ERROR',
        });
        return;
      }

      // Call original handler with validated data
      handler(validation.data);
    } catch (error) {
      console.error(`Error in ${String(eventName)} handler:`, error);
      socket.emit('error', {
        message: 'Server error processing request',
        code: 'SERVER_ERROR',
      });
    }
  };
}

// Validation helper function for events without data
export function withValidationNoData<T extends keyof typeof SocketEventSchemas>(
  socket: Socket,
  eventName: T,
  handler: () => void
) {
  return () => {
    try {
      // Rate limiting check
      if (!checkRateLimit(socket.id, eventName as keyof typeof RATE_LIMITS)) {
        console.warn(
          `Rate limit exceeded for ${socket.id} on event ${String(eventName)}`
        );
        socket.emit('error', {
          message: 'Rate limit exceeded. Please slow down.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }

      // Input validation (for void events, no data validation needed)
      const validation = validateSocketEvent(eventName, undefined);

      if (!validation.success) {
        console.warn(
          `Validation failed for ${socket.id} on event ${String(eventName)}:`,
          validation.error
        );
        socket.emit('error', {
          message: `Invalid input: ${validation.error}`,
          code: 'VALIDATION_ERROR',
        });
        return;
      }

      // Call original handler
      handler();
    } catch (error) {
      console.error(`Error in ${String(eventName)} handler:`, error);
      socket.emit('error', {
        message: 'Server error processing request',
        code: 'SERVER_ERROR',
      });
    }
  };
}

// Generic error wrapper for handlers without validation
export function withErrorHandling<T extends readonly unknown[]>(
  socket: Socket,
  eventName: string,
  handler: (...args: T) => void
) {
  return (...args: T) => {
    try {
      handler(...args);
    } catch (error) {
      console.error(`Error in ${eventName} handler:`, error);
      socket.emit('error', {
        message: 'Server error processing request',
        code: 'SERVER_ERROR',
      });
    }
  };
}

// Connection validation middleware
export function createConnectionValidationMiddleware() {
  return (socket: Socket, next: (err?: Error) => void) => {
    // Basic connection validation
    if (!socket.id || socket.id.length > 50) {
      next(new Error('Invalid socket ID'));
      return;
    }

    // Log connection for monitoring
    console.log(`[SUCCESS] Validated connection: ${socket.id}`);
    next();
  };
}

// Additional security headers middleware
export function createSecurityMiddleware() {
  return (socket: Socket, next: (err?: Error) => void) => {
    // Add security-related socket metadata
    socket.data = {
      connectedAt: Date.now(),
      requestCount: 0,
      ...socket.data,
    };

    next();
  };
}
