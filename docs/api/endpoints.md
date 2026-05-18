# API Endpoints

Base path global: `/api`

## Public MVP (Wave 1)
- `GET /api/health/status`
- `POST /api/coach/sessions`
- `POST /api/coach/sessions/:sessionId/turns`
- `GET /api/coach/sessions/:sessionId`
- `GET /api/learner/profile`
- `GET /api/learner/state`
- `GET /api/learner/snapshots`
- `GET /api/review/queue`
- `POST /api/review/queue/:itemId/complete`
- `GET /api/config/preferences`
- `PUT /api/config/preferences`

Detailed payload contracts and examples:
- see `docs/api/wave-1.md`

## Future/Planned (Out of Wave 1)
- `POST /api/voice/transcribe`
- `POST /api/voice/synthesize`
- `GET /api/sessions`
- `GET /api/sessions/:sessionId`

## Implemented After Wave 1 (Phase 4)
- `POST /api/reading/sessions`
- `POST /api/reading/sessions/:sessionId/attempts`
- `GET /api/progress/summary`
