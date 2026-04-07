import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodObject } from 'zod';

/**
 * Validate request data against a Zod schema.
 *
 * Supports two schema shapes:
 * 1. Flat schema — validates req.body only (legacy)
 * 2. Structured schema with `query`, `body`, and/or `params` keys —
 *    validates each part of the request independently and assigns
 *    the parsed values back onto the request object.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Detect structured schema (has query/body/params keys)
      const shape = (schema as ZodObject<any>).shape;
      if (shape && (shape.query || shape.body || shape.params)) {
        const parsed = schema.parse({
          ...(shape.query ? { query: req.query } : {}),
          ...(shape.body ? { body: req.body } : {}),
          ...(shape.params ? { params: req.params } : {}),
        });
        if (parsed.query) (req as any).query = parsed.query;
        if (parsed.body) req.body = parsed.body;
        if (parsed.params) (req as any).params = parsed.params;
      } else {
        // Flat schema — body only (legacy behaviour)
        req.body = schema.parse(req.body);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
}

/**
 * Validate request query params against a Zod schema.
 * Parsed values are assigned back to req.query.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
}
