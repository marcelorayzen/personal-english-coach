# ADR-002: Architectural Style

## Status
Accepted

## Decision
The system uses a monorepo and modular monolith architecture.

## Consequences
- shared types and contracts remain local and explicit
- module boundaries must be preserved inside one deployable backend
- microservices are explicitly deferred
