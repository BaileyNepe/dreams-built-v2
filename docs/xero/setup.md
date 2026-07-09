# Xero integration — setup

The app connects to one Xero organisation via a custom OAuth 2.0 app. Projects sync
two-way (app is the source of truth), payroll is read from Xero Payroll NZ (pay runs,
payslips, leave balances), and approved weekly timesheets can be pushed into Xero as
draft payroll timesheets.

## 1. Create the Xero app(s)

Go to <https://developer.xero.com/app/manage> and create a **custom** app:

- **Dev app** ("Dreams Built Dev"): redirect URI
  `http://localhost:<EXPRESS_PORT>/api/v1/xero/callback` (e.g. port 5003).
- **Prod app** ("Dreams Built"): redirect URI
  `https://<api-domain>/api/v1/xero/callback`.

Note the Client ID and Client Secret for each. While creating the app, check the exact
scope names offered — apps created after March 2026 use Xero's granular scopes, and the
`XERO_SCOPES` env var below may need the granular equivalents (e.g. `payroll.payslips.read`
vs `payroll.payslip.read`). The scope list is env-driven for exactly this reason.

## 2. Dev sandbox: the Demo Company (NZ)

Xero has no sandbox API. Instead, enable the **Demo Company**: in Xero, click your org
name (top-left) → *Try the Demo Company* → region **New Zealand** (it ships with sample
Payroll NZ employees and Projects). When the app redirects you to Xero to authorise, pick
the Demo Company — production is untouched. The demo org resets every ~28 days, which
orphans stored links in dev (expected; reconnect and re-map).

## 3. Environment variables (`apps/server/.env`)

```bash
CLIENT_URL=http://localhost:3000            # where the OAuth callback redirects back to
XERO_CLIENT_ID=...                          # from the Xero app
XERO_CLIENT_SECRET=...
XERO_REDIRECT_URI=http://localhost:5003/api/v1/xero/callback   # must match the app EXACTLY
XERO_TOKEN_ENCRYPTION_KEY=...               # 64 hex chars; generate with the command below
# Optional — defaults are built in; override if the portal shows different scope names:
# XERO_SCOPES=openid profile email offline_access projects accounting.contacts payroll.employees.read payroll.settings.read payroll.payruns.read payroll.payslips.read payroll.timesheets
```

Generate the encryption key:

```bash
openssl rand -hex 32
```

All Xero vars are optional at boot — the server runs without them and the Xero endpoints
return a clear "not configured" error until they're set.

## 4. Connect and map

1. Log in as an ADMIN → sidebar **Xero** (`/dashboard/settings/xero`) → **Connect to
   Xero** → authorise the organisation.
2. **Employees tab**: link each Xero payroll employee to their app user (one-click
   suggestions appear when emails match). Linked employees see their own payslips and
   leave on **My Pay**.
3. **Clients tab**: optionally map app clients to existing Xero contacts. Unmapped
   clients get a contact created automatically the first time one of their jobs is
   pushed.
4. **Defaults tab**: pick the earnings rate used for timesheet exports (e.g. "Ordinary
   Hours").

## 5. Day-to-day

- **Projects**: on a project's edit page, the Xero panel lets you *Create in Xero*, link
  an existing Xero project, or unlink. Linked projects re-sync automatically whenever the
  job is updated in the app (failures never block the save — you get a warning instead).
- **Payroll** (`/dashboard/payroll`): Pay Runs (with payslip drill-down), Employees &
  Leave, and Timesheet Export tabs.
- **Timesheet export**: pick a week → the preview shows each user's hours per day and any
  blockers (unlinked user, non-weekly calendar, already exported) → select rows → *Push
  to Xero* creates draft timesheets. Approve or Revert from the same table. Double-pushing
  a week for the same user is blocked by a DB unique constraint.
- **My Pay** (`/dashboard/payroll/me`): every employee/contractor/manager sees their own
  recent payslips and leave balances.

## Constraints & notes

- **Single server instance**: Xero refresh tokens are single-use; the refresh mutex in
  `apps/server/src/libs/xero/tokens.ts` is in-process. If the server ever scales past one
  instance, replace it with a Postgres advisory lock.
- **Idle expiry**: refresh tokens die after 60 days unused. The home-dashboard widget and
  settings page show a "reconnect soon" warning; reconnecting is one click.
- **Timesheet export MVP** supports weekly, Monday-aligned Xero payroll calendars.
  Fortnightly/monthly calendars are blocked per user with a clear message in the preview.
- Tokens are AES-256-GCM encrypted at rest in the `xero_connection` table and are never
  returned by any API endpoint.
- Xero rate limits (60 calls/min) are absorbed by short-TTL server caches; posted pay
  runs cache for an hour.
