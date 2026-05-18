# API Contracts

The API should prefer explicit, stable, typed payloads.

## Rules
- no implicit magic fields
- no undocumented endpoints
- use ids with explicit names
- prefer summaries and operational state over raw history dumps

## Error Envelope (standard)
All HTTP errors return a common envelope:

```json
{
  "timestamp": "2026-04-16T21:00:00.000Z",
  "method": "POST",
  "path": "/api/coach/sessions/sess_123/turns",
  "error": {
    "status": 400,
    "code": "BAD_REQUEST",
    "message": "learnerText is required",
    "details": []
  }
}
```

Notes:
- `error.details` is present when validation returns multiple field messages.
- `code` is normalized (`BAD_REQUEST`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`, etc).

## Wave 1 Contract Reference
- `docs/api/wave-1.md`
