# ADR-005: Voice Persistence Policy

## Status
Accepted

## Decision
The MVP stores transcription and turn/session metadata, but does not persist raw audio by default.

## Consequences
- lower storage and privacy burden in the MVP
- future raw-audio retention must be opt-in and explicitly documented
