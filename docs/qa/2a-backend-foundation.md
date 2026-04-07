# QA: 2a Backend Foundation

## Checklist

- [x] package.json has all required deps — All dependencies and devDependencies match spec exactly
- [x] tsconfig.json is valid — Targets ES2020, strict: true, esModuleInterop: true, outDir: dist, rootDir: src
- [x] knexfile.ts properly configured — Development and production environments, DATABASE_URL env var with default, migrations/seeds directories set
- [x] Config reads all env vars with sensible defaults — PORT (3000), DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRY (15m), JWT_REFRESH_EXPIRY (30d), NODE_ENV, CORS_ORIGIN
- [x] Auth middleware handles both required and optional auth — requireAuth throws 401 on missing/invalid token, optionalAuth sets req.user to null on failure
- [x] Validation middleware uses Zod — validate(schema) factory returns middleware, 422 with VALIDATION_ERROR code on failure
- [x] Error handler returns consistent ApiResponse format — AppError returns { success, message, code }, unknown errors return 500 INTERNAL_ERROR
- [x] JWT utils generate and verify both token types — generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken all implemented
- [x] Express app has helmet, cors, rate limit, error handler — All four applied in correct order in src/index.ts
- [x] Health check endpoint exists — GET /api/v1/health returns { success: true, data: { status: 'ok' } }
