# Spec: Core Conversation

## Goal
Provide a voice-first conversation flow with structured persistence and lightweight pedagogical correction.

## Requirements
- create conversation session
- receive learner input
- transcribe learner input
- generate Ray response
- provide at most 1 or 2 main corrections
- persist session and utterances
- emit signals for learner memory updates
