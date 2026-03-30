<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lamtec CRM (Prototype)

This repository currently contains a frontend-first CRM prototype built with React + Vite.

For modernization and go-live guidance, see:
- [State-of-the-art roadmap](docs/CRM_STATE_OF_THE_ART_ROADMAP.md)
- [Production go-live plan](docs/PRODUCTION_GO_LIVE_PLAN.md)
- [Practical improvement backlog](docs/IMPROVEMENT_BACKLOG.md)

View your app in AI Studio: https://ai.studio/apps/498d546f-5d44-4da7-aa73-e91888524d3c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Visits Calendar + Outlook

- Open **Visits Calendar** in the app.
- For each visit, use **Add to Outlook** to open a prefilled Outlook event draft.
- Use **ICS** to download a standards-based calendar file for a single visit, or **Export Upcoming (.ics)** to import all upcoming visits into Outlook in one step.

### Company-wide Outlook sync (recommended)

For automatic bi-directional sync (instead of manual import), connect this app to Microsoft Graph:

1. Register an Azure AD app with delegated permissions: `Calendars.ReadWrite`, `offline_access`, `User.Read`.
2. Implement OAuth sign-in (MSAL) and exchange tokens server-side.
3. Create/update Outlook events via Graph `/me/events` when a visit is created/edited/deleted.
4. Subscribe to calendar webhooks (`/subscriptions`) to pull Outlook-side updates back into CRM.
5. Store `outlookEventId` per visit to keep records in sync.
