# VoteFlow Project Status

**Updated:** 2026-11-06

## Integration status

The client and Django API are wired together for the current product flows. Authentication and token refresh, poll browsing and creation, voting and Paystack payment verification, results, wallet and withdrawal requests, notifications, profile updates, and organizer approval use API calls. Transactional email is configured through Resend.

The last recorded client production build and Django configuration check passed before this frontend pass. The backend has not been connected to PostgreSQL or external provider accounts, and no database migrations were run. Deployment is therefore pending environment setup and database initialization.

The UI now exposes the connected voter, creator, administrator, results, and inline-payment flows. Notification preferences, avatar uploads, email changes, and two-factor authentication remain unavailable because the API does not expose those operations; the settings page links only to supported account tools.

## Routes

| Area | Status |
|---|---|
| Public poll listing and detail | Connected to the API |
| Public results listing and standings | Connected to the API |
| Login, registration, and password reset | Connected to the API |
| Dashboard, poll creation, and organizer access | Connected to the API |
| Wallet, withdrawal requests, and notifications | Connected to the API |
| Paid votes | Paystack InlineJS v2 checkout; server creates and verifies payment references |
| Vote confirmation | `/vote-success` shows poll and contestant details after a recorded vote |
| Admin console navigation | Available to administrator accounts in public and dashboard navigation |

## Before running the application

Configure PostgreSQL, Resend, Paystack, the client origin, and image storage as described in [the server setup guide](../../voteflow-server/SETUP.md). Copy the server and client environment templates, then apply the repository's migrations once a database is ready.

The `.kiro` RBAC roadmap contains additional unimplemented scope, including its expanded contest state machine, voter identity verification, security monitoring, integration tests, and migration verification. Its checkpoint items remain open until those steps can be completed against a database and configured services.
