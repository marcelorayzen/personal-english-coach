# Wave 1 API Contracts

Base URL prefix: `/api`

## `GET /api/health/status`

### 200 response
```json
{
  "module": "health",
  "status": "ready",
  "readiness": {
    "app": "ok",
    "db": "ok"
  },
  "metrics": {
    "totalRequests": 42,
    "averageDurationMs": 12.3,
    "byStatusClass": {
      "2xx": 38,
      "4xx": 4
    },
    "byRoute": {
      "GET /api/health/status": 10
    },
    "lastRequestAt": "2026-04-16T21:00:00.000Z"
  },
  "checkedAt": "2026-04-16T21:00:00.000Z",
  "latencyMs": 4
}
```

## `POST /api/coach/sessions`

### request
```json
{
  "title": "Conversation - travel practice"
}
```

### 201 response
```json
{
  "sessionId": "cm9xxyz123",
  "learnerProfileId": "cm9xlearner123",
  "sessionType": "conversation",
  "title": "Conversation - travel practice",
  "startedAt": "2026-04-16T21:00:00.000Z"
}
```

## `POST /api/coach/sessions/:sessionId/turns`

### request
```json
{
  "learnerText": "I has a booking for tomorrow",
  "languageCode": "en-US",
  "durationMs": 2400
}
```

### 201 response
```json
{
  "sessionId": "cm9xxyz123",
  "learnerUtterance": {
    "id": "utt_l_1",
    "role": "learner",
    "transcript": "I has a booking for tomorrow",
    "createdAt": "2026-04-16T21:00:01.000Z"
  },
  "coachUtterance": {
    "id": "utt_c_1",
    "role": "coach",
    "transcript": "Nice effort. Main fix for this turn: Say 'I have ...' instead of 'I has ...'. Now try one more sentence with that pattern.",
    "createdAt": "2026-04-16T21:00:01.200Z"
  },
  "systemUtterance": {
    "id": "utt_s_1",
    "role": "system",
    "transcript": "Applied 1 correction focus point(s). 1. Use 'have' with 'I'.",
    "createdAt": "2026-04-16T21:00:01.200Z"
  },
  "corrections": [
    {
      "issue": "Use 'have' with 'I'.",
      "guidance": "Say 'I have ...' instead of 'I has ...'."
    }
  ],
  "synthesis": {
    "provider": "mock-synthesis",
    "format": "text/plain",
    "audioUrl": null
  }
}
```

### 400 response example
```json
{
  "timestamp": "2026-04-16T21:00:00.000Z",
  "method": "POST",
  "path": "/api/coach/sessions/cm9xxyz123/turns",
  "error": {
    "status": 400,
    "code": "BAD_REQUEST",
    "message": "learnerText is required"
  }
}
```

## `GET /api/coach/sessions/:sessionId`

### 200 response
```json
{
  "sessionId": "cm9xxyz123",
  "learnerProfileId": "cm9xlearner123",
  "sessionType": "conversation",
  "title": "Conversation - travel practice",
  "startedAt": "2026-04-16T21:00:00.000Z",
  "endedAt": null,
  "utterances": [
    {
      "id": "utt_l_1",
      "role": "learner",
      "transcript": "I has a booking for tomorrow",
      "languageCode": "en-US",
      "provider": "mock-transcription",
      "durationMs": 2400,
      "transcriptionConfidence": 0.99,
      "createdAt": "2026-04-16T21:00:01.000Z"
    }
  ]
}
```

## `GET /api/learner/profile`

### 200 response
```json
{
  "learnerProfileId": "cm9xlearner123",
  "displayName": "Default Learner",
  "levelEstimate": "A2",
  "speakingConfidence": 0.4,
  "readingConfidence": 0.45,
  "ptBrSupportLevel": "medium",
  "correctionIntensity": "balanced",
  "currentFocus": "Present simple and past simple",
  "learningGoal": "Improve speaking consistency",
  "preferredInteractionStyle": null,
  "createdAt": "2026-04-16T20:00:00.000Z",
  "updatedAt": "2026-04-16T21:00:00.000Z"
}
```

## `GET /api/learner/state`

### 200 response
```json
{
  "learnerProfileId": "cm9xlearner123",
  "summary": {
    "sessionCount": 3,
    "utteranceCount": 14,
    "mistakeCount": 4,
    "trackedSkillCount": 1,
    "averageSkillScore": 0.72
  },
  "topWeaknesses": [
    {
      "category": "grammar",
      "count": 3
    }
  ],
  "recommendations": [
    "Focus short drills on grammar to reduce repeated mistakes."
  ],
  "derivedAt": "2026-04-16T21:00:00.000Z",
  "latestSnapshot": {
    "id": "snap_1",
    "summary": "Sessions: 3; Utterances: 14; Weaknesses: grammar (3)",
    "createdAt": "2026-04-16T21:00:00.000Z"
  }
}
```

## `GET /api/learner/snapshots`

### 200 response
```json
{
  "learnerProfileId": "cm9xlearner123",
  "total": 2,
  "items": [
    {
      "id": "snap_2",
      "summary": "Sessions: 3; Utterances: 14; Weaknesses: grammar (3)",
      "createdAt": "2026-04-16T21:00:00.000Z"
    },
    {
      "id": "snap_1",
      "summary": "Sessions: 2; Utterances: 10; Weaknesses: grammar (2)",
      "createdAt": "2026-04-16T20:30:00.000Z"
    }
  ]
}
```

## `GET /api/review/queue`

### 200 response
```json
{
  "learnerProfileId": "cm9xlearner123",
  "total": 1,
  "items": [
    {
      "id": "review_1",
      "itemType": "mistake:grammar",
      "prompt": "Do 5 short sentences focused on correct tense and agreement.",
      "priority": 80,
      "isCompleted": false,
      "createdAt": "2026-04-16T21:00:00.000Z"
    }
  ]
}
```

## `POST /api/review/queue/:itemId/complete`

### 201 response
```json
{
  "itemId": "review_1",
  "isCompleted": true
}
```

### 404 response example
```json
{
  "timestamp": "2026-04-16T21:00:00.000Z",
  "method": "POST",
  "path": "/api/review/queue/review_999/complete",
  "error": {
    "status": 404,
    "code": "NOT_FOUND",
    "message": "Review queue item review_999 was not found"
  }
}
```

## `GET /api/config/preferences`

### 200 response
```json
{
  "learnerProfileId": "cm9xlearner123",
  "ptBrSupportLevel": "medium",
  "correctionIntensity": "balanced",
  "learningGoal": "Improve speaking consistency",
  "currentFocus": "Present simple and past simple",
  "updatedAt": "2026-04-16T21:00:00.000Z"
}
```

## `PUT /api/config/preferences`

### request
```json
{
  "ptBrSupportLevel": "low",
  "correctionIntensity": "light",
  "learningGoal": "Travel conversation fluency",
  "currentFocus": "Past simple"
}
```

### 200 response
```json
{
  "learnerProfileId": "cm9xlearner123",
  "ptBrSupportLevel": "low",
  "correctionIntensity": "light",
  "learningGoal": "Travel conversation fluency",
  "currentFocus": "Past simple"
}
```
