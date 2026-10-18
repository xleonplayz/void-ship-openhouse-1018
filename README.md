# Studio Nori Open House

A dependency-free Node.js form application with native HTML POST → 303 → GET navigation and a JSON validation endpoint. Run `npm start`; `PORT` defaults to 3000.

The fixture exercises URL-encoded bodies, repeated checkbox fields, stable URLSearchParams sorting, literal plus signs versus spaces, Unicode, newlines, duplicate scalar rejection, unsupported media types and an 8 KiB body limit. Workshop duplicates are collapsed in first-seen order. No accounts, credentials, database or real booking is involved; use synthetic demo information only. Receipt URLs contain the normalized input, and the interface explains this before submission.

GET `/health`, `/api/echo`, `/receipt`; POST `/rsvp` (browser redirect) and `/api/rsvp` (JSON). Logs contain method, path, release and status, never submitted field values. All HTTP response bodies are strings. Both local and Dev checks use a real Chromium browser.
